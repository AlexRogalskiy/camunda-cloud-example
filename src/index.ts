import { BucketWorker } from './worker/bucket.worker';
import { WebsiteshotWorker } from './worker/websiteshot.worker';
import { ZeebeController } from './controller/zeebe.controller';
import { logger } from './utils/Logger';

async function run() {
  logger.info(`Connecting Zeebe Client`);
  const zeebeController = new ZeebeController();
  await zeebeController.getTopology();

  logger.info(`Creating Zeebe Workers`);
  const websiteshotWorker = new WebsiteshotWorker(zeebeController);
  websiteshotWorker.create();

  const bucketWorker = new BucketWorker(zeebeController);
  bucketWorker.create();
}

run();
