import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { AutoRouter, error } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/images',
  catch: defaultErrorHandler
})
  .get('/:b64ImageKey', async (req, env) => {
    const imageKey = atob(req.params.b64ImageKey)
    const object = await env.AD_IMAGES_BUCKET.get(imageKey)
    if (object === null) {
      return error(400, 'image not found')
    }
    const contentType = object.customMetadata?.type ?? null
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('size', object.size.toString())
    headers.set('Access-Control-Expose-Headers', 'etag')
    headers.set('access-control-allow-origin', '*')
    if (contentType !== null) {
      headers.set('Content-Type', contentType)
    }
    return new Response(object.body, { headers })
  })
