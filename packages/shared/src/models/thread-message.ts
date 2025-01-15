import type { IAuthenticatedMessageSender } from './authenticated-message-sender'
import type { UnauthenticatedMessageSender } from './unauthenticated-message-sender'

export interface IThreadMessage {
  id: number
  createdAt: Date
  unread: boolean
  threadId: string
  recipientId: number | null
  recipientEmail: string | null
  adId: number
  senderId: number | null
  sender: IAuthenticatedMessageSender | null
  unauthenticatedSender: UnauthenticatedMessageSender | null
  content: string
  anuncio: {
    id: number
    marca: string
    modelo: string
    ano: number
    anoModelo: number
  }
}
