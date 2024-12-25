import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { getImageStorageKey, getParamsFromImageStorageKey, InvalidImageKey } from '@/helpers/get-image-storage-key'
import { sha256 } from '@cmp/api/helpers/shsa256'
import { ALLOWED_IMAGE_MIME_TYPES as allowedImageMimeTypes } from '@cmp/shared/constants'
import { AutoRouter, error, StatusError } from 'itty-router'
import { z } from 'zod'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/ads',
  catch: defaultErrorHandler
})
  .post('/:b64AdId/images', async (req, env) => {
    const userId = req.userId
    const adId = z.string().uuid().parse(atob(req.params.b64AdId))
    const contentType = req.headers.get('Content-Type')
    if (!contentType?.match(/multipart\/form-data/)) {
      throw new StatusError(415)
    }
    const formData = (await req.formData()) as FormData
    const r2Keys: string[] = []
    for (const [key, value] of Array.from(formData.entries())) {
      const file = value as unknown
      const [, type, i] = key.match(/(\w+)\[(\d+)\]/) ?? []
      const idx = Number.parseInt(i)
      if (!Number.isNaN(idx)) {
        if (type === 'file' && file instanceof File) {
          if (!allowedImageMimeTypes.includes(file.type)) {
            console.warn(`discarding file ${file.name}, mime type ${file.type} not allowed`)
            throw new StatusError(400, `mime_type_not_allowed: ${file.type}`)
          }
          const { type } = file
          const hash = await sha256(file)
          const storageKey = getImageStorageKey({ userId, adId, sha256: hash })
          const obj = await env.AD_IMAGES_BUCKET.put(storageKey, await file.arrayBuffer(), {
            sha256: hash,
            httpMetadata: { contentType: type }
          })

          r2Keys.push(btoa(obj.key))
        }
      }
    }
    return r2Keys
  })
  /*
  .delete('/:b64AdId/images/:b64ImageKey', async (req, env) => {
    const authenticatedUserId = req.userId
    const imageKey = atob(req.params.b64ImageKey)
    const adId = atob(req.params.b64AdId)
    try {
      const params = getParamsFromImageStorageKey(imageKey)
      if (params.userId !== authenticatedUserId) {
        return error(403, 'Unauthorized')
      }
      else if (adId !== params.adId) {
        return error(400, 'invalid ad id')
      }
    }
    catch (err) {
      if (err instanceof InvalidImageKey) {
        return error(400, 'invalid image key')
      }
      else {
        throw err
      }
    }
    console.log('DELETING', imageKey)
    return { ok: true }
  })
    */
