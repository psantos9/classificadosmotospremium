import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import type { IUserSocketMetadata } from '@cmp/shared/models/user-socket-metadata'
import { PING_PERIOD_MS, SOCKET_TIMEOUT_MS } from '@/constants'
import { getUserDO } from '@/durable-objects/UserDO'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { authenticateRequest } from '@/middleware/authenticate-request'
import { AutoRouter, type IRequest, json, StatusError } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, CF>({
  base: '/api/v1/ws',
  catch: defaultErrorHandler
})
  .post<IAppAuthenticatedRequest, [Env, ExecutionContext]>('/', authenticateRequest, async (req, env) => {
    const { user = null } = req
    if (user === null) {
      throw new StatusError(401)
    }
    const { id: userId } = user
    const userAgent = req.headers.get('user-agent')
    const { colo } = req.cf as IncomingRequestCfProperties

    const metadata: IUserSocketMetadata = { userId, colo, userAgent }
    const token = crypto.randomUUID()

    await env.SOCKET_AUTH.put(token, JSON.stringify(metadata), { expirationTtl: 60 })
    return json({ token, pingPeriodMs: PING_PERIOD_MS, socketTimeoutMs: SOCKET_TIMEOUT_MS })
  })
  .get<IRequest, [Env, ExecutionContext]>('/:token', async (req, env: Env) => {
    if (req.headers.get('upgrade') !== 'websocket') {
      throw new StatusError(400, 'bad request')
    }
    const encodedToken = req.params.token ?? null
    if (encodedToken === null) {
      throw new StatusError(401)
    }
    let token: string | null = null
    try {
      const encodedPayload = JSON.parse(atob(encodedToken)) as unknown
      if (
        typeof encodedPayload === 'object'
        && encodedPayload !== null
        && 'token' in encodedPayload
        && typeof encodedPayload.token === 'string'
      ) {
        ;({ token } = encodedPayload)
      }
    }
    catch (err) {
      console.error('SOCKET_UPGRADE: error while decoding token', err)
      throw new StatusError(401)
    }
    if (token === null) {
      return new StatusError(401)
    }
    const metadata = await env.SOCKET_AUTH.get<IUserSocketMetadata>(token, 'json')
    if (metadata === null) {
      return new StatusError(401)
    }
    await env.SOCKET_AUTH.delete(token)

    if (req.headers.get('user-agent') !== metadata.userAgent || (req.cf?.colo ?? null) !== metadata.colo) {
      return new StatusError(401)
    }

    const { userId } = metadata
    const stub = await getUserDO(userId, env.USER_DO)
    const response = await stub.fetch(new Request('http://users/ws', { headers: { upgrade: 'websocket' }, cf: req.cf }))
    return response
  })
