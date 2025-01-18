import type { Env } from '@/types'
import v1 from '@/routes/api/v1'
import { AutoRouter, type IRequest } from 'itty-router'

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: '/api' }).all('/v1/*', v1.fetch)

export default router
