import { z } from 'zod'

const REQUIRED_ERROR = 'Obrigatório'

export const getUnauthenticatedMessageSenderSchema = () => z.object({
  name: z.string({ required_error: REQUIRED_ERROR }).nonempty(REQUIRED_ERROR),
  email: z.string({ required_error: REQUIRED_ERROR }).email('E-mail inválido').nonempty(REQUIRED_ERROR).transform(val => val.toLowerCase()),
  mobile: z.string({ required_error: REQUIRED_ERROR }).nonempty(REQUIRED_ERROR).transform(val => val.replace(/\D+/g, ''))
})

export const novaMensagemSchema = z.object({
  adId: z.number().int(),
  threadId: z.string().uuid().optional(),
  recipient: z.union([z.number().int(), z.string().email().transform(val => val.toLowerCase())]).optional(),
  unauthenticatedSender: getUnauthenticatedMessageSenderSchema().optional(),
  content: z.string()
})

export type NovaMensagem = z.infer<typeof novaMensagemSchema>
