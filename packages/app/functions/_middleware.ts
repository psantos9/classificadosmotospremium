import type { ContextData, Env } from '@/types'
import type { PagesFunction } from '@cloudflare/workers-types'
import { jwtVerify } from 'jose'
import { JWSSignatureVerificationFailed } from 'jose/errors'

const bearerRegex = /Bearer\s(\w.+)/
const unauthenticatedURLs: Record<string, string[]> = {
  '/api/v1/healthcheck': ['GET'], // getting healthcheckks
  '/api/v1/login': ['OPTIONS', 'POST'], // logging in
  '/api/v1/cadastro': ['POST'], // add cadastro
  '/api/v1/cadastro/verificar': ['OPTIONS', 'POST']
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
  const url = new URL(request.url)
  if (unauthenticatedURLs[url.pathname]?.includes(request.method)) {
    return next()
  }
  else {
    const match = bearerRegex.exec(request.headers.get('authorization') ?? '')
    if (match === null) {
      return new Response(null, { status: 401 })
    }
    const [, bearerToken] = match
    try {
      const claims = await jwtVerify(bearerToken, new TextEncoder().encode(env.API_SECRET))
      data.userId = claims.payload.sub
    }
    catch (err) {
      if (err instanceof JWSSignatureVerificationFailed) {
        return new Response(null, { status: 401 })
      }
      throw err
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
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  })
}
