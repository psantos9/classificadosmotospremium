import type { Env } from '@cmp/api/types'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getUserDO } from '@cmp/api/durable-objects/UserDO'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { novaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

/*
  adId: z.number().int(),
  threadId: z.string().uuid().optional(),
  recipient: z.union([z.number().int(), z.string().email()]),
  unauthenticatedSender: getUnauthenticatedMessageSenderSchema().optional(),
  content: z.string()
})
  */
export const processAdMessageEventSchema = z.object({
  senderId: z.number().int().nullable(),
  message: novaMensagemSchema
})

export type ProcessAdMessageEvent = z.infer<typeof processAdMessageEventSchema>

export class ProcessAdMessageWorkflow extends WorkflowEntrypoint<Env, ProcessAdMessageEvent > {
  async run(event: WorkflowEvent<ProcessAdMessageEvent>, step: WorkflowStep) {
    const db = getDb(this.env.DB)
    const payload = processAdMessageEventSchema.parse(event.payload)
    const { message: { content, adId, recipient } } = payload
    const recipientId = typeof recipient === 'number' ? recipient : null
    const recipientEmail = typeof recipient === 'string' ? recipient : null
    let { senderId, message: { unauthenticatedSender = null, threadId = null } } = payload

    if (recipientId !== null) {
      await step.do('validate recipient id', { timeout: '10 seconds' }, async () => {
        const usuario = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.id, recipientId) }) ?? null
        if (usuario === null) {
          throw new NonRetryableError(`could not find recipient id ${recipientId}`)
        }
      })
    }

    if (threadId !== null) {
      await step.do('validate threadId for ad', { timeout: '10 seconds' }, async () => {
        const mensagem = await db.query.mensagem.findFirst({ where: (mensagem, { eq, and }) => and(eq(mensagem.threadId, threadId as unknown as string), eq(mensagem.adId, adId)) }) ?? null
        if (mensagem === null) {
          throw new NonRetryableError(`threadId ${threadId} does not exist for adId ${adId}`)
        }
      })
    }

    if (unauthenticatedSender !== null) {
      const { email } = unauthenticatedSender
      // find if the provided email matches any existing userId
      ;({ senderId, unauthenticatedSender } = await step.do('fetch senderId', { timeout: '10 seconds' }, async () => {
        const usuario = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.email, email) }) ?? null
        if (usuario !== null) {
          senderId = usuario.id
          unauthenticatedSender = null
        }
        return { senderId, unauthenticatedSender }
      }))
      if (typeof senderId === 'number') {
        const [result = null] = await db.select({ threadId: schema.mensagem.threadId })
          .from(schema.mensagem)
          .where(and(eq(schema.mensagem.adId, adId), eq(schema.mensagem.senderId, senderId)))
          .limit(1) ?? null
        if (result !== null) {
          threadId = result.threadId
        }
      }
      else {
      // find if a thread exists for this unauthenticated sender of for the add
        await step.do('find any existing thread for this unauthenticated sender and for the ad', { timeout: '10 seconds' }, async () => {
          const [result = null] = await db.select({ threadId: schema.mensagem.threadId })
            .from(schema.mensagem)
            .where(and(eq(schema.mensagem.adId, adId), eq(sql`json_extract(${schema.mensagem.unauthenticatedSender}, '$.email')`, email)))
            .limit(1)
          if (result !== null) {
            threadId = result.threadId
          }
        })
      }
    }

    await step.do('insert the message in the database', { timeout: '10 seconds' }, async () => {
      await db.insert(schema.mensagem).values({ recipientId, recipientEmail, adId, senderId, content, unauthenticatedSender, threadId: threadId || crypto.randomUUID() }).returning()
    })

    if (recipientId !== null) {
      await step.do('notify the recipient user of new messages', { timeout: '10 seconds' }, async () => {
        const stub = await getUserDO(recipientId, this.env.USER_DO)
        await stub.sendUnreadMessages()
      })
    }
    if (senderId !== null) {
      await step.do('notify the sender user of new messages', { timeout: '10 seconds' }, async () => {
        const stub = await getUserDO(senderId as number, this.env.USER_DO)
        await stub.sendUnreadMessages()
      })
    }

    if (recipientEmail !== null) {
      await step.do('send email to recipiend', { timeout: '10 seconds' }, async () => {
        console.log('SENDING EMAIL TO ', recipientEmail)
      })
    }
  }
}
