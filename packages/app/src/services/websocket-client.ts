import type { APIClient } from './api-client'
import { AxiosError } from 'axios'
import Emittery from 'emittery'

export interface IWebSocketClient {
  authenticate: () => Promise<void>
  connect: () => Promise<void>
  sendMessage: (msg: string) => Promise<void>
}

export enum WebSocketClientState {
  DISCONNECTED = 'DISCONNECTED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface IAuthenticationContext {
  userId: number
}

export class AuthenticationError extends Error {
  constructor() {
    super()
    this.name = 'AuthenticationError'
  }
}

export interface WebSocketClientEventMap {
  'state-update': WebSocketClientState
  'message': string
  'disconnected': { code: number, reason: string, wasClean: boolean }
  'rtt': number
}

export default class WebSocketClient extends Emittery<WebSocketClientEventMap> implements IWebSocketClient {
  private api: APIClient
  private pingTimeout: ReturnType<typeof setTimeout> | null = null
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private pingPeriodMs: number = 10000
  private socketTimeoutMs: number = 30000
  private token: string | null = null
  private ws: WebSocket | null = null
  private _lastPing: number = -1
  private _rtt: number = -1

  constructor(params: { api: APIClient }) {
    super()
    this.api = params.api
  }

  get rtt() {
    return this._rtt
  }

  set rtt(rtt: number) {
    this._rtt = rtt
    void this.emit('rtt', this._rtt)
  }

  private async sendPing() {
    if (this.ws === null) {
      throw new Error('not connected')
    }
    if (this.watchdog !== null) {
      clearTimeout(this.watchdog)
    }
    this.watchdog = null

    this.ws.send('ping')
    this._lastPing = new Date().getTime()
    this.watchdog = setTimeout(() => {
      this.rtt = Number.NaN
      console.warn('pong timeout...')
      void this.disconnect()
    }, this.socketTimeoutMs)
  }

  private receivePong() {
    const now = new Date().getTime()
    this.rtt = now - this._lastPing
    if (this.watchdog !== null) {
      clearTimeout(this.watchdog)
      this.watchdog = null
    }

    this.pingTimeout = setTimeout(() => {
      void this.sendPing()
    }, this.pingPeriodMs)
  }

  async sendMessage(msg: string) {
    this.ws?.send(msg)
  }

  async authenticate() {
    void this.emit('state-update', WebSocketClientState.AUTHENTICATING)

    const headers: Record<string, string> = {
      authorization: `Bearer ${this.api.bearerToken}`
    }

    try {
      const {
        token,
        pingPeriodMs,
        socketTimeoutMs
      } = await this.api.axios
        .post<{
        token: string
        pingPeriodMs: number
        socketTimeoutMs: number
      }>('api/v1/ws', { headers })
        .then(({ data }) => data)
      void this.emit('state-update', WebSocketClientState.AUTHENTICATED)
      this.pingPeriodMs = pingPeriodMs
      this.socketTimeoutMs = socketTimeoutMs
      this.token = token
    }
    catch (error) {
      void this.emit('state-update', WebSocketClientState.ERROR)
      if (error instanceof AxiosError) {
        // eslint-disable-next-line ts/no-unsafe-assignment
        const { status = null } = error?.response?.data ?? {}
        if (status === 403 || status === 401) {
          throw new AuthenticationError()
        }
      }
      throw error
    }
  }

  async connect() {
    if (this.token === null) {
      throw new Error('not connected')
    }
    void this.emit('state-update', WebSocketClientState.CONNECTING)
    const url = new URL(this.api.baseURL)
    url.protocol = url.protocol === 'https:' ? 'wss' : 'ws'
    url.pathname = `${url.pathname}api/v1/ws/${btoa(JSON.stringify({ token: this.token }))}`
    if (this.ws !== null) {
      this.ws = null
    }

    this.ws = new WebSocket(url.toString())

    this.ws.addEventListener('open', () => {
      void this.emit('state-update', WebSocketClientState.CONNECTED)
      void this.sendPing()
    })

    this.ws.addEventListener('close', (event: CloseEvent) => {
      void this.disconnect()
      void this.emit('state-update', WebSocketClientState.DISCONNECTED)
      const { code, reason, wasClean } = event
      void this.emit('disconnected', { code, reason, wasClean })
    })

    this.ws.addEventListener('message', (event: MessageEvent<any>) => {
      const rawMsg = event.data as string
      if (rawMsg === 'pong') {
        this.receivePong()
      }
      else {
        void this.emit('message', rawMsg)
      }
    })
  }

  async disconnect() {
    this.ws?.close()
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout)
    }
    if (this.watchdog !== null) {
      clearTimeout(this.watchdog)
    }
  }
}
