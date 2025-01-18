import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { ImageService } from '@/services/image-service'
import { AutoRouter, error } from 'itty-router'
import { z } from 'zod'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/images',
  catch: defaultErrorHandler
})
  .get('/:imageId/:variant?', async (req, env, ctx) => {
    const paramsSchema = z.object({ imageId: z.string(), variant: z.enum(['thumbnail']).optional() })
    const { imageId, variant } = paramsSchema.parse(req.params)
    const imageService = ImageService.getInstance(env)
    const cache = caches.default
    let res = await cache.match(req.clone())
    if (res) {
      return res
    }
    const image = await imageService.get(imageId)
    if (image === null) {
      return error(404, 'image not found')
    }
    const transformation = variant === 'thumbnail' ? 'tr:n-ik_ml_thumbnail,bg-black' : undefined
    res = await fetch(imageService.getImageUrl(image, transformation))
    if (res.status === 200 && res.ok) {
      const headers = new Headers(res.headers)
      headers.delete('x-server')
      headers.delete('X-Amz-Cf-Id')
      headers.delete('X-Amz-Cf-Pop')
      headers.delete('X-Cache')
      // add caching header, configured here for 1-year
      headers.set('cache-control', `public, max-age=31536000`)
      // vary header so cache respects content-negotiation/auto-format
      headers.set('vary', 'Accept')
      // create response and add to the cache if successful
      res = new Response(res.body, { ...res, headers })
      ctx.waitUntil(cache.put(req.clone(), res.clone()))
      return res
    }
    return error(500, 'an error occurred while fetching image')
  })
