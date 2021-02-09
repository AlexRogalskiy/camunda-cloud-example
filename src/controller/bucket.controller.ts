import { BucketParams } from '../types/BucketParams.type'
import { SecretAccessKey } from '../types/SecretAccessKey.type'
import { logger } from '../utils/Logger'

const fs = require('fs')
const AWS = require('aws-sdk')

export class BucketController {
  private s3: any

  constructor(
    private secretAccessKey: SecretAccessKey,
    private bucketName: string,
  ) {
    // eslint-disable-next-line id-length
    this.s3 = new AWS.S3({
      accessKeyId: this.secretAccessKey.id,
      secretAccessKey: this.secretAccessKey.secret,
    })
  }

  public upload(source: string, target: string): Promise<string> {
    const content = fs.readFileSync(source)
    const params: BucketParams = {
      Bucket: this.bucketName,
      Key: target,
      Body: content,
      Metadata: {
        'Content-Type': 'image/png',
      },
    }
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (error, data) => {
        if (error) {
          reject(error)
        }
        logger.info(`Uploaded ${data.key} to ${data.Location}`)
        resolve(data.Location)
      })
    })
  }
}
