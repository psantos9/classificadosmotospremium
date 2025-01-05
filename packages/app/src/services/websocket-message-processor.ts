export interface IWebSocketMessageProcessor {
  parseMsg: (rawMsg: string) => Promise<void>
}

export interface IWebSocketMessageProcessorParams {
  // onPlayerRegistration: (registration: string | PlayerRegistration) => Promise<void> | void
  // onPlayerRegistrationStatus: (playerRegistrationStatus: IPlayerRegistrationStatus) => Promise<void> | void
}
export class WebSocketMessageProcessor implements IWebSocketMessageProcessor {
  // onPlayerRegistration: (registration: string | PlayerRegistration) => Promise<void> | void
  // onPlayerRegistrationStatus: (playerRegistrationStatus: IPlayerRegistrationStatus) => Promise<void> | void

  constructor(_params: IWebSocketMessageProcessorParams) {
    // const { onPlayerRegistration, onPlayerRegistrationStatus } = params
    // this.onPlayerRegistration = onPlayerRegistration
    // this.onPlayerRegistrationStatus = onPlayerRegistrationStatus
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
        case 'registration':
          // void this.onPlayerRegistration(msg.payload as string | PlayerRegistration)
          break
        case 'registration-status':
          // void this.onPlayerRegistrationStatus(msg.payload as IPlayerRegistrationStatus)
          break
        case 'player-update-available':
        case 'set-screen-rotation':
        case 'restart':
        case 'reset':
        default:
          console.log('not implemented', msg.type, msg.payload)
      }
    }
    else {
      console.warn('invalid socket message', rawMsg)
    }
  }
}
