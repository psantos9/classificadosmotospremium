import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { AutoRouter, error } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/typesense',
  catch: defaultErrorHandler
})
  .post('/rebuild', async (req, env) => {
    if (!req.user.superadmin) {
      return error(403)
    }
    const jobId = await env.REBUILD_INDEXES_WORKFLOW.create()
    return { jobId }
  })
