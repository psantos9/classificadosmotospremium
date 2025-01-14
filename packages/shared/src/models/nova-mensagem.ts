import { z } from 'zod'

const REQUIRED_ERROR = 'Obrigatório'

export const getUnauthenticatedMessageSenderSchema = () => z.object({
  name: z.string({ required_error: REQUIRED_ERROR }).nonempty(REQUIRED_ERROR),
  email: z.string({ required_error: REQUIRED_ERROR }).email('E-mail inválido').nonempty(REQUIRED_ERROR),
  mobile: z.string({ required_error: REQUIRED_ERROR }).nonempty(REQUIRED_ERROR).transform(val => val.replace(/\D+/g, ''))
})

export const getNovaMensagemSchema = () => z.object({
  adId: z.number().int(),
  unauthenticatedSender: getUnauthenticatedMessageSenderSchema().optional(),
  content: z.string()
})

export type NovaMensagem = ReturnType<typeof getNovaMensagemSchema>
