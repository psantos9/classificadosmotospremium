import type { Env } from '@cmp/api/types'
import { sha256 } from '@cmp/api/helpers/shsa256'

export interface IImage {
  fileId: string
  name: string
  size: number
  versionInfo: {
    id: string
    name: string
  }
  filePath: string
  url: string
  fileType: string
  height: number
  width: number
  thumbnail: string
  AITags: null
}

export class ImageService {
  private readonly _authorizationHeader: string
  readonly urlEndpoint: string
  readonly environment: string

  constructor(params: { imageKit: { privateKey: string, urlEndpoint: string }, environment: string }) {
    const { imageKit: { privateKey, urlEndpoint }, environment } = params
    this._authorizationHeader = `Basic ${btoa(`${privateKey}:`)}`
    this.urlEndpoint = urlEndpoint
    this.environment = environment
  }

  private _getAdFolder(adId: number) {
    return `classificadosmotospremium/${this.environment}/${adId}`
  }

  getImageUrl(image: IImage, transformation?: string) {
    const url = `${this.urlEndpoint}${transformation ? `/${transformation}/` : '/'}${image.filePath}`
    return url
  }

  async upload(params: { adId: number, file: File }): Promise<IImage> {
    const { adId, file } = params
    const formdata = new FormData()
    formdata.append('fileName', await sha256(file))
    formdata.append('file', file)
    formdata.append('folder', this._getAdFolder(adId))
    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: this._authorizationHeader },
      body: formdata
    })
    const body = await res.json()
    if (res.status !== 200 || !res.ok) {
      console.error(body)
      throw new Error('could not upload file')
    }
    const image = body as IImage
    return image
  }

  async get(fileId: string): Promise<IImage | null> {
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}/details`, {
      method: 'GET',
      headers: {
        Authorization: this._authorizationHeader,
        Accept: 'application/json'
      }
    })
    const data = await res.json()
    if (res.status !== 200 || !res.ok) {
      console.error(data)
      return null
    }
    const image = data as IImage
    return image
  }

  async deleteMultiple(fileIds: string[]): Promise<{ successfullyDeletedFileIds: string[], errors?: Array<{ fileId: string, error: string } > }> {
    const res = await fetch('https://api.imagekit.io/v1/files/batch/deleteByFileIds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this._authorizationHeader,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ fileIds })
    })
    const data = await res.json()
    if ([200, 207].includes(res.status)) {
      return data as { successfullyDeletedFileIds: string[], errors?: Array<{ fileId: string, error: string } > }
    }
    else {
      console.error(data)
      throw new Error('could not delete files')
    }
  }

  async deleteAdFolder(adId: number) {
    const res = await fetch('https://api.imagekit.io/v2/folder', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this._authorizationHeader,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ folderPath: this._getAdFolder(adId) })
    })
    if (!res.ok) {
      throw new Error(`Error while deleting ad image folder ${adId}: ${res.status}`)
    }
  }

  static getInstance(env: Env) {
    const { IMAGEKIT_PRIVATE_KEY: privateKey, IMAGEKIT_URL_ENDPOINT: urlEndpoint } = env
    const instance = new ImageService({ imageKit: { privateKey, urlEndpoint }, environment: env.ENVIRONMENT })
    return instance
  }
}

export const getImageService = (env: Env) => {
  const instance = ImageService.getInstance(env)
  return instance
}
