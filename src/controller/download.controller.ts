const fs = require('fs')
const Path = require('path')
const Axios = require('axios')

export const DOWNLOAD_FOLDER = 'downloads'

export class DownloadController {
  public static async download(
    source: string,
    target: string,
  ): Promise<string> {
    const path = Path.resolve(__dirname, `../..`, DOWNLOAD_FOLDER, target)
    const writer = fs.createWriteStream(path)

    const response = await Axios({
      url: source,
      method: 'GET',
      responseType: 'stream',
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve(`done`))
      writer.on('error', reject(new Error(`Failed to write ${target}`)))
    })
  }
}
