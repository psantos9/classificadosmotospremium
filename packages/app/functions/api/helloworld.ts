import type { Env } from '@/types'
import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequestGet: PagesFunction<Env> = async (_context) => {
  return Response.json(({ time: `the time is ${new Date().toISOString()}` }))
}
