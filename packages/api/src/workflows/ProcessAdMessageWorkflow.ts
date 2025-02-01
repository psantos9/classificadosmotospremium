import type { Env } from '@cmp/api/types'
import type { Usuario } from '@cmp/shared/models/database/models'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getUsersDO } from '@/durable-objects/UsersDO'
import { getUserDO } from '@cmp/api/durable-objects/UserDO'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { novaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

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

    let recipientUser: Usuario | null = null
    if (recipientId !== null) {
      recipientUser = await step.do('validate recipient id', { timeout: '10 seconds' }, async () => {
        const usuario = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.id, recipientId) }) ?? null
        if (usuario === null) {
          throw new NonRetryableError(`could not find recipient id ${recipientId}`)
        }
        return usuario
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

    if (senderId !== null && threadId === null) {
      threadId = await step.do('find an existing thread id for ad, sender and recipient', { timeout: '10 seconds' }, async () => {
        const mensagem = await db.query.mensagem.findFirst({
          where: (mensagem, { eq, and, or }) => and(eq(mensagem.adId, adId), or(eq(mensagem.senderId, senderId as number), eq(schema.mensagem.recipientId, senderId as number)))
        })
        return mensagem?.threadId ?? null
      })
    }

    await step.do('insert the message in the database', { timeout: '10 seconds' }, async () => {
      await db.insert(schema.mensagem).values({ recipientId, recipientEmail, adId, senderId, content, unauthenticatedSender, threadId: threadId || crypto.randomUUID() }).returning()
    })

    if (recipientUser !== null) {
      const users = await getUsersDO(this.env)

      const sendEmailToRecipient = await step.do('check if an email is to be sent to the recipient', { timeout: '10 seconds' }, async () => {
        // condition to send email: user is offline and no email has been sent in the 30 minutes
        const userOnline = await users.getUserOnlineStatus(recipientUser.id)
        if (!userOnline) {
          const now = new Date().getTime()
          const deltaMiliSecs = 30 * 60 * 1e3
          const cutOffTimestamp = now - deltaMiliSecs
          const lastEmailSent = await users.getLastUserEmailSent(recipientUser.id).then(lastEmail => lastEmail?.getTime() ?? cutOffTimestamp)
          if (lastEmailSent <= cutOffTimestamp) {
            return true
          }
        }
        return false
      })

      if (sendEmailToRecipient) {
        await step.do('send email to recipient', { timeout: '10 seconds', retries: { limit: 0, delay: 0 } }, async () => {
          if (!this.env.POSTMARK_API_TOKEN) {
            throw new NonRetryableError('Can not send emails, POSTMARK_API_TOKEN secret is not defined!')
          }

          const response = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Postmark-Server-Token': this.env.POSTMARK_API_TOKEN
            },
            body: JSON.stringify({
              From: 'Classificados Motos Premium <contato@classificadosmotospremium.com.br>',
              To: recipientUser.email,
              Subject: 'Você tem novas mensagens!',
              HtmlBody: `<div>
  <p>
    Oie, tudo bem?
  </p>
  <p>
    Corre lá no <a href="classificadosmotospremium.com.br">classificados</a>, tem novas mensagens te esperando!
  </p>
  <p>
    <a href="classificadosmotospremium.com.br">Classificados Motos Premium</a>
  </p>
</div>`
            })
          })

          if (response.status !== 200) {
            const body = await response.json()
            throw new NonRetryableError(`${response.status}: ${JSON.stringify(body)}`)
          }
        })
      }

      await step.do('notify the recipient user of new messages', { timeout: '10 seconds' }, async () => {
        const stub = await getUserDO(recipientUser.id, this.env.USER_DO)
        await stub.sendUnreadMessages()
      })
    }

    if (senderId !== null) {
      await step.do('notify the sender user of new messages', { timeout: '10 seconds' }, async () => {
        const stub = await getUserDO(senderId as number, this.env.USER_DO)
        await stub.sendUnreadMessages()
      })
    }
  }
}
