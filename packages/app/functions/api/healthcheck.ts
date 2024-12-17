import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {}

export const onRequestGet: PagesFunction<Env> = async (_context) => {
  return Response.json({ ok: true })
}
