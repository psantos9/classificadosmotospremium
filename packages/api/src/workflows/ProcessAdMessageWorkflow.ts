import type { Env } from '@cmp/api/types'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getUserDO } from '@/durable-objects/UserDO'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { getNovaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { z } from 'zod'

export const processAdMessageEventSchema = z.object({
  recipientId: z.number().int(),
  senderId: z.number().int().nullable(),
  message: getNovaMensagemSchema()
})

export type ProcessAdMessageEvent = z.infer<typeof processAdMessageEventSchema>

export class ProcessAdMessageWorkflow extends WorkflowEntrypoint<Env, ProcessAdMessageEvent > {
  async run(event: WorkflowEvent<ProcessAdMessageEvent>, step: WorkflowStep) {
    const db = getDb(this.env.DB)
    const payload = processAdMessageEventSchema.parse(event.payload)
    const { recipientId, message: { content, adId } } = payload
    let { senderId, message: { unauthenticatedSender = null } } = payload

    if (senderId === null && unauthenticatedSender !== null) {
      const { email } = unauthenticatedSender
      ;({ senderId, unauthenticatedSender } = await step.do('fetch senderId', { timeout: '10 seconds' }, async () => {
        const usuario = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.email, email) }) ?? null
        if (usuario !== null) {
          senderId = usuario.id
          unauthenticatedSender = null
        }
        return { senderId, unauthenticatedSender }
      }))
    }

    await step.do('insert the message in the database', { timeout: '10 seconds' }, async () => {
      await db.insert(schema.mensagem).values({ recipientId, adId, senderId, content, unauthenticatedSender }).returning()
    })

    await step.do('notify the user of new messages', { timeout: '10 seconds' }, async () => {
      const stub = await getUserDO(recipientId, this.env.USER_DO)
      await stub.sendUnreadMessages()
    })

    await step.do('send an email', { timeout: '10 seconds' }, async () => {
      // await db.insert(schema.mensagem).values({ recipientId, adId, senderId, content, unauthenticatedSender }).returning()
    })

    console.log('PROCESSING AD MESSAGE', recipientId, senderId, content, adId, unauthenticatedSender)
    /*
    const adId = event.payload.adId
    await step.do('delete add from database', { timeout: '10 seconds' }, async () => {
      const db = getDb(this.env.DB)
      await db.delete(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
    })

    await step.do('delete document', { timeout: '10 seconds', retries: { limit: 0, delay: 1000 } }, async () => {
      const typesense = await useTypesense(this.env)
      await typesense.deleteAdDocument(adId)
    })
      */
  }
}
