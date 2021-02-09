import { GetResponse } from '@websiteshot/nodejs-client';
import { BucketController } from '../controller/bucket.controller';
import { ConfigController } from '../controller/config.controller';
import {
  DownloadController,
  DOWNLOAD_FOLDER,
} from '../controller/download.controller';
import { ScreenshotController } from '../controller/screenshot.controller';
import { ZeebeController } from '../controller/zeebe.controller';
import { ConfigParameter } from '../enums/config.parameter.enum';
import { Worker } from '../enums/worker.enum';
import { logger } from '../utils/Logger';
const Path = require('path');

export class BucketWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.AWS_BUCKET_UPLOAD,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const jobId = job.variables.jobId;
        if (!jobId) {
          complete.failure('Job Id not found on process context: <jobId>');
          return;
        }

        const screenshotController = new ScreenshotController({
          projectId: ConfigController.get(
            ConfigParameter.WEBSITESHOT_PROJECT_ID
          ),
          apikey: ConfigController.get(ConfigParameter.WEBSITESHOT_API_KEY),
        });

        const bucketController = new BucketController(
          {
            id: ConfigController.get(ConfigParameter.AWS_SECRET_ID),
            secret: ConfigController.get(ConfigParameter.AWS_SECRET_KEY),
          },
          ConfigController.get(ConfigParameter.AWS_BUCKET)
        );

        try {
          const getResponse: GetResponse = await screenshotController.get(
            jobId
          );
          const files: Array<{
            url: string;
            name: string;
          }> = getResponse.jobs.map((screenshotJob) => {
            return {
              url: screenshotJob.data,
              name: `${screenshotJob.url.name}.png`,
            };
          });
          files.forEach((file) => logger.info(`name: ${file.name}`));
          const downloadPromises = files.map((file) =>
            DownloadController.download(file.url, file.name)
          );
          await Promise.all(downloadPromises);

          await BucketWorker.sleep(5);

          logger.info(`Uploading Screenshots to Cloud Bucket`);

          const uploadPromises = files.map((file) =>
            bucketController.upload(
              Path.resolve(__dirname, `../..`, DOWNLOAD_FOLDER, file.name),
              file.name
            )
          );
          await Promise.all(uploadPromises);

          complete.success({ screenshots: uploadPromises.length });
        } catch (error) {
          complete.failure('Failed to send slack message');
        }
      },
    });
  }

  public static sleep(seconds: number): Promise<string> {
    logger.info(`Waiting ${seconds}sec until Screenshots have been processed`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        logger.info(`Finished waiting...`);
        resolve(`done`);
      }, seconds * 1000);
    });
  }
}
