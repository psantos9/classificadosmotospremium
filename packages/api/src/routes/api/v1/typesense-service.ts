import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { TypesenseService } from '@/services/typesense-service'
import { AutoRouter } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/typesense',
  catch: defaultErrorHandler
})
  .post('/collections/ads', async (_req, env) => {
    const typesense = new TypesenseService(env)
    const collection = await typesense.createAdsCollection()
    return collection
  })
  .get('/collections', async (_req, env) => {
    const typesense = new TypesenseService(env)
    const collection = await typesense.getCollections()
    return collection
  })
