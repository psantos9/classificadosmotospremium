import type { Env } from '@/types'
import type { Context } from 'hono'
import { DurableObject } from 'cloudflare:workers'
import { Hono } from 'hono'

export enum STORAGE_KEY_PREFIX {
  ID = 'ID',
  CREATED_AT = 'CREATED_AT'
}

export class UserAlreadyInitializedError extends Error {
  constructor() {
    super()
    this.name = 'UserAlreadyInitializedError'
    this.message = 'user is already initialized'
  }
}

export class UserDO extends DurableObject<Env> {
  private _id = -1
  private _createdAt = new Date()
  private _app: Hono = new Hono()
    .get('/ws', (c) => {
      console.log('GOTOT')
      return this.upgradeWebSocket(c)
    })

  fetch = this._app.fetch

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  get id() {
    return this._id
  }

  get createdAt() {
    return this._createdAt
  }

  async init(params: { userId: number }) {
    const { userId } = params
    if (this._id > -1) {
      throw new UserAlreadyInitializedError()
    }

    this._id = userId
    this._createdAt = new Date()

    await this.ctx.blockConcurrencyWhile(async () => {
      await Promise.all([
        this.ctx.storage.put(STORAGE_KEY_PREFIX.ID, this._id),
        this.ctx.storage.put<Date>(STORAGE_KEY_PREFIX.CREATED_AT, this._createdAt)
      ])
    })
  }

  async destroy() {
    await this.ctx.storage.deleteAll()
  }

  async upgradeWebSocket(c: Context) {
    console.log('COGONGO')
    if (c.req.header('upgrade') !== 'websocket') {
      return c.text('Expected Upgrade: websocket', 426)
    }
    const webSocketPair = new WebSocketPair()
    const [client, ws] = Object.values(webSocketPair)
    this.ctx.acceptWebSocket(ws)

    const currentAlarm = await this.ctx.storage.getAlarm()
    if (currentAlarm === null) {
      this.ctx.storage.setAlarm(Date.now() + 5 * 1e3)
    }
    console.log('CONNECTED WEBSOCKET')
    const responseInit: ResponseInit = { status: 101, webSocket: client }
    return new Response(null, responseInit)
  }

  async webSocketMessage(ws: WebSocket, msg: unknown) {
    console.log('GOT MESSAGE', msg)
  }

  async closeOrErrorHandler(params: { ws: WebSocket, close?: { code: number, reason: string, wasClean: boolean }, error?: unknown }) {
    const { ws, close, error } = params
    console.log('CLOSED', ws, close, error)
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    this.closeOrErrorHandler({ ws, close: { code, reason, wasClean } })
  }

  async webSocketError(ws: WebSocket, error: Error) {
    this.closeOrErrorHandler({ ws, error })
  }
}

export const getUserDO = async (userId: number, userDO: DurableObjectNamespace<UserDO>) => {
  const id: DurableObjectId = userDO.idFromName(userId.toString())
  const stub = userDO.get(id)
  if (!(await stub.id)) {
    await stub.init({ userId })
  }
  return stub
}
