import type { ContextData, Env } from '@/types'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequestGet: PagesFunction<Env, any, ContextData> = async (_context) => {
  return Response.json({ ok: true })
}
