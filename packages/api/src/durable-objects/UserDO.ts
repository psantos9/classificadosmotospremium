import type { Env } from '@cmp/api/types'
import type { Context } from 'hono'
import { getUsersDO } from '@cmp/api/durable-objects/UsersDO'
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
  private _userId = -1
  private _createdAt = new Date()
  private _app: Hono = new Hono()
    .get('/ws', c => this.upgradeWebSocket(c))

  fetch = this._app.fetch

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'))
    this.ctx.blockConcurrencyWhile(async () => {
      await this.load()
    })
  }

  get userId() {
    return this._userId
  }

  get createdAt() {
    return this._createdAt
  }

  async init(params: { userId: number }) {
    const { userId } = params
    if (this._userId > -1) {
      throw new UserAlreadyInitializedError()
    }

    this._userId = userId
    this._createdAt = new Date()

    await this.ctx.blockConcurrencyWhile(async () => {
      await Promise.all([
        this.ctx.storage.put(STORAGE_KEY_PREFIX.ID, this._userId),
        this.ctx.storage.put<Date>(STORAGE_KEY_PREFIX.CREATED_AT, this._createdAt)
      ])
    })
  }

  async load() {
    const [userId = -1, createdAt = new Date()] = await Promise.all([
      this.ctx.storage.get<number>(STORAGE_KEY_PREFIX.ID),
      this.ctx.storage.get<Date>(STORAGE_KEY_PREFIX.CREATED_AT)
    ])
    this._userId = userId
    this._createdAt = createdAt
  }

  async destroy() {
    await this.ctx.storage.deleteAll()
  }

  async upgradeWebSocket(c: Context) {
    if (c.req.header('upgrade') !== 'websocket') {
      return c.text('Expected Upgrade: websocket', 426)
    }
    const webSocketPair = new WebSocketPair()
    const [client, ws] = Object.values(webSocketPair)
    this.ctx.acceptWebSocket(ws)
    await getUsersDO(this.env).setUserOnline(this.userId, c.req.raw.cf)

    const responseInit: ResponseInit = { status: 101, webSocket: client }
    return new Response(null, responseInit)
  }

  async webSocketMessage(ws: WebSocket, msg: unknown) {
    if (msg !== 'ping') {
      console.log('GOT MESSAGE', msg)
    }
  }

  async closeOrErrorHandler(params: { ws: WebSocket, close?: { code: number, reason: string, wasClean: boolean }, error?: unknown }) {
    const { ws, close, error } = params
    await getUsersDO(this.env).setUserOffline(this.userId)
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
  if (await stub.userId === -1) {
    await stub.init({ userId })
  }
  return stub
}
