import type { Mensagem } from '@cmp/shared/models/database/models'

export interface IWebSocketMessageProcessor {
  parseMsg: (rawMsg: string) => Promise<void>
}

export interface IWebSocketMessageProcessorParams {
  onUnreadMessages: (messages: Mensagem[]) => Promise<void> | void
}
export class WebSocketMessageProcessor implements IWebSocketMessageProcessor {
  onUnreadMessages: (messages: Mensagem[]) => Promise<void> | void

  constructor(params: IWebSocketMessageProcessorParams) {
    const { onUnreadMessages } = params
    this.onUnreadMessages = onUnreadMessages
  }

  async parseMsg(rawMsg: string) {
    const msg = JSON.parse(rawMsg) as object
    if (
      typeof msg === 'object'
      && msg !== null
      && 'type' in msg
      && typeof msg.type === 'string'
      && 'payload' in msg
    ) {
      switch (msg.type) {
        case 'unread-messages':
          void this.onUnreadMessages(msg.payload as Mensagem[])
          break
        default:
          console.log('not implemented', msg.type, msg.payload)
      }
    }
    else {
      console.warn('invalid socket message', rawMsg)
    }
  }
}
