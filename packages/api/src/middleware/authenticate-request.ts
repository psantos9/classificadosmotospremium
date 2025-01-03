import type { Env } from '@/types'
import { MAX_TOKEN_AGE, TOKEN_ISSUER } from '@/helpers/getBearerToken'
import { type IRequest, StatusError } from 'itty-router'
import { jwtVerify } from 'jose'
import { z, ZodError } from 'zod'

const bearerRegex = /Bearer\s(\w.+)/

export const authenticateRequest = async (req: IRequest, env: Env) => {
  const match = bearerRegex.exec(req.headers.get('authorization') ?? '')
  if (match === null) {
    throw new StatusError(401)
  }
  const [, bearerToken] = match
  try {
    const claims = await jwtVerify(bearerToken, new TextEncoder().encode(env.API_SECRET), { issuer: TOKEN_ISSUER, maxTokenAge: MAX_TOKEN_AGE })
    req.userId = z.coerce.number().parse(claims.payload.sub)
  }
  catch (err) {
    if (!(err instanceof ZodError)) {
      console.error(err)
    }

    return new Response(null, { status: 401 })
  }
}

export const getUserIdFromAuthenticationHeader = async (req: IRequest, env: Env) => {
  const match = bearerRegex.exec(req.headers.get('authorization') ?? '')
  if (match === null) {
    return
  }
  const [, bearerToken] = match
  try {
    const claims = await jwtVerify(bearerToken, new TextEncoder().encode(env.API_SECRET), { issuer: TOKEN_ISSUER, maxTokenAge: MAX_TOKEN_AGE })
    req.userId = z.coerce.number().parse(claims.payload.sub)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_err) {
  }
}
