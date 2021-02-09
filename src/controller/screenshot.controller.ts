import {
  Config,
  CreateRequest,
  CreateResponse,
  GetResponse,
  WebsiteshotController,
} from '@websiteshot/nodejs-client';

export class ScreenshotController {
  private websiteshotController: WebsiteshotController;
  constructor(private config: Config) {
    this.websiteshotController = new WebsiteshotController(this.config);
  }

  public async create(templateId: string): Promise<CreateResponse> {
    const createRequest: CreateRequest = {
      templateId,
    };
    const response: CreateResponse = await this.websiteshotController.create(
      createRequest
    );
    return response;
  }

  public async get(jobId: string): Promise<GetResponse> {
    const response: GetResponse = await this.websiteshotController.get(jobId);
    return response;
  }
}
