import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { AutoRouter, error, json, StatusError } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/fipe',
  catch: defaultErrorHandler
})
  .get('/', async (_req, _env) => {
    return json({ ok: true })
  })
