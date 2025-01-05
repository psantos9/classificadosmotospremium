import type { WebSocketClientState } from '@/services/websocket-client'
import type { WebSocketMessageProcessor } from '@/services/websocket-message-processor'
import type { APIClient } from './api-client'
import WebSocketClient, { AuthenticationError } from '@/services/websocket-client'
import Bottleneck from 'bottleneck'
import Emittery from 'emittery'

export enum WebSocketServiceEvent {
  STATE_UPDATE = 'state-update',
  RTT = 'rtt'
}

export interface WebSocketServiceEventMap {
  [WebSocketServiceEvent.STATE_UPDATE]: WebSocketClientState
  [WebSocketServiceEvent.RTT]: number
}

export class WebSocketService extends Emittery<WebSocketServiceEventMap> {
  readonly webSocketClient: WebSocketClient
  private webSocketMessageProcessor: WebSocketMessageProcessor
  private reconnectLimiter: Bottleneck
  private _rtt: number = -1

  constructor(params: {
    api: APIClient
    webSocketMessageProcessor: WebSocketMessageProcessor
  }) {
    super()
    const { webSocketMessageProcessor, api } = params
    this.webSocketMessageProcessor = webSocketMessageProcessor

    this.webSocketClient = new WebSocketClient({ api })

    this.webSocketClient.on('state-update', (state) => {
      void this.emit(WebSocketServiceEvent.STATE_UPDATE, state)
    })

    this.webSocketClient.on('message', (rawMsg) => {
      void this.webSocketMessageProcessor.parseMsg(rawMsg)
    })

    this.webSocketClient.on('disconnected', () => {
      if (api.signedIn) {
        void this.start()
      }
    })

    this.webSocketClient.on('rtt', (rtt) => {
      this.rtt = rtt
    })

    this.reconnectLimiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 1000,
      highWater: 1,
      strategy: Bottleneck.strategy.OVERFLOW
    })

    this.reconnectLimiter.on('failed', async (error, jobInfo) => {
      // Exponential backoff:
      // on every retry, we exponentially increase the time to wait.
      // (2 ** 1) * 100 = 200 ms
      // (2 ** 2) * 100 = 400 ms
      // (2 ** 3) * 100 = 800 ms
      let expBackoffDelayMs = 500 + Math.random() * 500 + 2 ** jobInfo.retryCount * 100
      if (expBackoffDelayMs > 30000) {
        expBackoffDelayMs = 1000
      } // cap max backoff delay to 30seconds
      console.warn(
        `${jobInfo.options.id} #${
          jobInfo.retryCount
        } => connect failed: ${(error as Error).message}, retrying in ${(expBackoffDelayMs / 1000).toFixed(
          1
        )} seconds...`
      )
      return expBackoffDelayMs
    })

    this.reconnectLimiter.on('retry', (_, jobInfo) => console.log(`Now retrying ${jobInfo.options.id}`))
  }

  get rtt() {
    return this._rtt
  }

  set rtt(rtt: number) {
    this._rtt = rtt
    void this.emit(WebSocketServiceEvent.RTT, this._rtt)
  }

  async start() {
    await this.reconnectLimiter.schedule({}, async () => {
      try {
        await this.webSocketClient.authenticate()
        await this.webSocketClient.connect()
      }
      catch (err) {
        if (err instanceof AuthenticationError) {
          void this.start()
        }
        else {
          throw err
        }
      }
    })
  }

  async stop() {
    await this.webSocketClient.disconnect()
  }
}
