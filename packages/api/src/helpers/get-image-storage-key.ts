import { z } from 'zod'

const imageR2KeySchema = z.object({ adId: z.number(), file: z.object({ sha256: z.string(), ext: z.string().optional() }).optional() })
export type ImageKeyParams = z.infer<typeof imageR2KeySchema>

export class InvalidImageKey extends Error {
  constructor() {
    super()
    this.name = 'InvalidImageKey'
  }
}

export const getImageStorageKey = (params: ImageKeyParams) => {
  const { adId, file } = imageR2KeySchema.parse(params)
  const keyParams: Array<number | string> = [adId]
  if (file) {
    const { sha256, ext } = file
    keyParams.push(`${sha256}${ext ? `.${ext}` : ''}`)
  }
  const key = keyParams.join('/')
  return key
}

export const getParamsFromImageStorageKey = (imageStorageKey: string): ImageKeyParams => {
  try {
    const [adIdAndSha256, ext] = imageStorageKey.split('.')
    const [adId, sha256] = adIdAndSha256.split('/')
    const file = sha256 ? undefined : { sha256, ext }
    const params = imageR2KeySchema.parse({ adId, file })
    return params
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_err) {
    throw new InvalidImageKey()
  }
}
