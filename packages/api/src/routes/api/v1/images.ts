import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { AutoRouter, error } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/images',
  catch: defaultErrorHandler
})
  .get('/:b64ImageKey', async (req, env, ctx) => {
    const cache = caches.default
    let res = await cache.match(req.clone())
    if (res) {
      return res
    }
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
    // add caching header, configured here for 1-year
    headers.set('cache-control', `public, max-age=31536000`)
    // vary header so cache respects content-negotiation/auto-format
    headers.set('vary', 'Accept')
    if (contentType !== null) {
      headers.set('Content-Type', contentType)
    }
    res = new Response(object.body, { headers })
    ctx.waitUntil(cache.put(req.clone(), res.clone()))
    return res
  })
  .get('/:b64ImageKey/thumbnail', async (req, env, ctx) => {
    const cache = caches.default
    let res = await cache.match(req.clone())
    if (res) {
      return res
    }
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
    // add caching header, configured here for 1-year
    headers.set('cache-control', `public, max-age=31536000`)
    // vary header so cache respects content-negotiation/auto-format
    headers.set('vary', 'Accept')
    if (contentType !== null) {
      headers.set('Content-Type', contentType)
    }
    res = new Response(object.body, { headers })
    ctx.waitUntil(cache.put(req.clone(), res.clone()))
    return res
  })
