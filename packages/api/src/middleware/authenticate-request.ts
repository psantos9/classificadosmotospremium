import type { Env } from '@cmp/api/types'
import { MAX_TOKEN_AGE, TOKEN_ISSUER } from '@cmp/api/helpers/getBearerToken'
import { getDb } from '@cmp/shared/helpers/get-db'
import { error, type IRequest, StatusError } from 'itty-router'
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
    const userId = z.coerce.number().parse(claims.payload.sub)
    const db = getDb(env.DB)
    const user = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.id, userId) }) ?? null
    if (user === null) {
      return error(401, 'Unauthorized')
    }
    req.user = user
  }
  catch (err) {
    if (!(err instanceof ZodError)) {
      console.error(err)
    }
    return error(401, 'Unauthorized')
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
