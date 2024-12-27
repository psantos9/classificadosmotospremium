import { z } from 'zod'

const imageR2KeySchema = z.object({ adId: z.number(), sha256: z.string().optional() })
export type ImageKeyParams = z.infer<typeof imageR2KeySchema>

export class InvalidImageKey extends Error {
  constructor() {
    super()
    this.name = 'InvalidImageKey'
  }
}

export const getImageStorageKey = (params: ImageKeyParams) => {
  const { adId, sha256 } = imageR2KeySchema.parse(params)
  const keyParams: Array<number | string> = [adId]
  if (sha256) {
    keyParams.push(sha256)
  }
  return keyParams.join('/')
}

export const getParamsFromImageStorageKey = (imageStorageKey: string): ImageKeyParams => {
  try {
    const [adId, sha256] = imageStorageKey.split('/')
    const params = imageR2KeySchema.parse({ adId, sha256 })
    return params
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_err) {
    throw new InvalidImageKey()
  }
}
