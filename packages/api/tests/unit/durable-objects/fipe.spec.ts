import type { Env } from '@/types'
import { createExecutionContext, env, SELF, waitOnExecutionContext } from 'cloudflare:test'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const getStub = (env: Env) => {
  const id = env.FIPE_DO.idFromName('fipe-client')
  const stub = env.FIPE_DO.get(id)
  return stub
}

describe('worker', () => {
  it('should deny request for short paths', async () => {
    const stub = getStub(env)
    console.log(await stub.latestTable)
  })
})
