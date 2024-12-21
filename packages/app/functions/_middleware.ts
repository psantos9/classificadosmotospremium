import type { ContextData, Env } from '@/types'
import type { PagesFunction } from '@cloudflare/workers-types'
import { jwtVerify } from 'jose'
import { JWSSignatureVerificationFailed } from 'jose/errors'
import { MAX_TOKEN_AGE, TOKEN_ISSUER } from './helpers/getBearerToken'

const bearerRegex = /Bearer\s(\w.+)/
const unauthenticatedURLs: Record<string, string[]> = {
  '/api/v1/healthcheck': ['GET'], // getting healthcheckks
  '/api/v1/login': ['OPTIONS', 'POST'], // logging in
  '/api/v1/cadastro': ['OPTIONS', 'POST'], // add cadastro
  '/api/v1/cadastro/verificar': ['OPTIONS', 'POST'],
  '/api/v1/cadastro/cep/*': ['OPTIONS', 'GET']
}

const errorHandling: PagesFunction<Env> = async (context) => {
  const { next } = context
  try {
    return await next()
  }
  catch (err) {
    const _err = err as Error
    return new Response(`${_err.message}\n${_err.stack}`, { status: 500 })
  }
}

const authentication: PagesFunction<Env, any, ContextData> = async (context) => {
  const { request, next, env, data } = context
  if (request.method === 'OPTIONS') {
    return next()
  }
  const url = new URL(request.url)
  const parentWildcard = [...url.pathname.split('/').slice(0, -1), '*'].join('/')
  if ((unauthenticatedURLs[url.pathname] ?? unauthenticatedURLs[parentWildcard])?.includes(request.method)) {
    return next()
  }
  else {
    const match = bearerRegex.exec(request.headers.get('authorization') ?? '')
    if (match === null) {
      return new Response(null, { status: 401 })
    }
    const [, bearerToken] = match
    try {
      const claims = await jwtVerify(bearerToken, new TextEncoder().encode(env.API_SECRET), { issuer: TOKEN_ISSUER, maxTokenAge: MAX_TOKEN_AGE })
      data.userId = claims.payload.sub
    }
    catch (err) {
      if (err instanceof Error) {
        console.error(err.message)
      }
      return new Response(null, { status: 401 })
    }
  }
  return next()
}

const setCorsHeaders: PagesFunction<Env, any, ContextData> = async (context) => {
  const response = await context.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export const onRequest: PagesFunction<Env>[] = [errorHandling, setCorsHeaders, authentication]

export const onRequestOptions: PagesFunction<Env, any, ContextData> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  })
}
