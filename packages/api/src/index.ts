import type { Env } from '@/types'
import api from '@/routes/api'
import { AutoRouter, cors, error, type IRequest } from 'itty-router'

const { preflight, corsify } = cors()

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
  base: '/',
  before: [preflight],
  finally: [corsify]
}).all('/api/*', api.fetch)

export default <ExportedHandler<Env>>{
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => router.fetch(req, env, ctx).catch(error)
}
