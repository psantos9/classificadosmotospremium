import type { Env } from '@/types'
import { FipeClient } from '@/durable-objects/fipe'
import { UserDO } from '@/durable-objects/UserDO'
import { UsersDO } from '@/durable-objects/UsersDO'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import api from '@/routes/api'
import { AdReviewWorkflow } from '@/workflows/AdReviewWorkflow'
import { DeleteAdWorkflow } from '@/workflows/DeleteAdWorkflow'
import { ProcessAdMessageWorkflow } from '@/workflows/ProcessAdMessageWorkflow'
import { AutoRouter, cors, type IRequest } from 'itty-router'

export { AdReviewWorkflow, DeleteAdWorkflow, FipeClient, ProcessAdMessageWorkflow, UserDO, UsersDO }

const { preflight, corsify } = cors()

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
  base: '/',
  before: [preflight],
  finally: [corsify],
  catch: defaultErrorHandler
}).all('/api/*', api.fetch)

export default <ExportedHandler<Env>>{
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => router.fetch(req, env, ctx)
}
