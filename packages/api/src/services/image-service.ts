import type { Env } from '@/types'
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
  readonly kv: KVNamespace
  readonly environment: string

  constructor(params: { imageKit: { privateKey: string, urlEndpoint: string }, kv: KVNamespace, environment: string }) {
    const { imageKit: { privateKey, urlEndpoint }, kv, environment } = params
    this._authorizationHeader = `Basic ${btoa(`${privateKey}:`)}`
    this.urlEndpoint = urlEndpoint
    this.kv = kv
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
    console.log('GOT IMAGE', image)
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

  async deleteAdFolder(_adId: number) {
    throw new Error('delete ad folder to be implemented')
  }

  static getInstance(env: Env) {
    const { IMAGEKIT_PRIVATE_KEY: privateKey, IMAGEKIT_URL_ENDPOINT: urlEndpoint } = env
    const instance = new ImageService({ imageKit: { privateKey, urlEndpoint }, kv: env.IMAGES, environment: env.ENVIRONMENT })
    return instance
  }
}
