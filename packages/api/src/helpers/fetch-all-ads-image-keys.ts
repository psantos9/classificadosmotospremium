import type { Env } from '@/types'
import { getImageStorageKey } from '@cmp/api/helpers/get-image-storage-key'

export const fetchAdImageKeys = async (params: { env: Env, userId: number, adId: number }) => {
  const { env, userId, adId } = params
  const r2Bucket = env.AD_IMAGES_BUCKET

  const options = {
    prefix: getImageStorageKey({ userId, adId })
  }
  const listed = await r2Bucket.list(options)

  let truncated = listed.truncated
  // @ts-expect-error listed.cursor not defined
  let cursor = truncated ? listed.cursor : undefined

  while (truncated) {
    const next = await r2Bucket.list({
      ...options,
      cursor
    })
    listed.objects.push(...next.objects)

    truncated = next.truncated
    // @ts-expect-error wrong typings
    cursor = next.cursor
  }
  return listed.objects.map(object => object.key)
}
