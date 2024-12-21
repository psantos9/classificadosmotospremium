import type { Env } from '@/types'
import { AutoRouter, error, type IRequest, json } from 'itty-router'

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
  base: '/api/v1',
  catch: (err) => {
    return error(500, err.message)
  }
})
  .get<IRequest, [Env, ExecutionContext]>('/healthcheck', () => {
    return json({ ok: true })
  })
export default router
