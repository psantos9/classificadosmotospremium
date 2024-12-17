import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {}

export const onRequest: PagesFunction<Env> = async (_context) => {
  return Response.json(({ time: `time is ${new Date().toISOString()}` }))
}
