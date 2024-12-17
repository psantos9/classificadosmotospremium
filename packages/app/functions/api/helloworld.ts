import type { PagesFunction } from '@cloudflare/workers-types'

interface Env {}

export const onRequest: PagesFunction<Env> = async (_context) => {
  return new Response(`time is ${new Date().toISOString()}`)
}
