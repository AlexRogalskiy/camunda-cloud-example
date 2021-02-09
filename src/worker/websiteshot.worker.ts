import { ConfigController } from '../controller/config.controller';
import { ScreenshotController } from '../controller/screenshot.controller';
import { ZeebeController } from '../controller/zeebe.controller';
import { ConfigParameter } from '../enums/config.parameter.enum';
import { Worker } from '../enums/worker.enum';
import { logger } from '../utils/Logger';

export class WebsiteshotWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.WEBSITESHOT_CREATE_JOB,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const templateId = job.customHeaders.templateid;

        if (!templateId) {
          complete.failure('Template Id not set as header <templateid>');
          return;
        }

        logger.info(`Creating Screenshot Job for Template Id ${templateId}`);

        const screenshotController = new ScreenshotController({
          projectId: ConfigController.get(
            ConfigParameter.WEBSITESHOT_PROJECT_ID
          ),
          apikey: ConfigController.get(ConfigParameter.WEBSITESHOT_API_KEY),
        });

        try {
          const response = await screenshotController.create(templateId);
          complete.success({ jobId: response.jobId });
        } catch (error) {
          logger.error(error);
          complete.failure('Failed to create screenshot job via websiteshot');
        }
      },
    });
  }
}
