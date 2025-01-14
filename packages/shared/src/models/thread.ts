import type { IAuthenticatedMessageSender } from './authenticated-message-sender'
import type { UnauthenticatedMessageSender } from './unauthenticated-message-sender'

export interface IThread {
  ultimaAtualizacao: Date
  unreadMessages: number
  unauthenticatedSender: UnauthenticatedMessageSender | null
  sender: IAuthenticatedMessageSender | null
  anuncio: {
    id: number
    marca: string
    modelo: string
    ano: number
    anoModelo: number
  }
}
