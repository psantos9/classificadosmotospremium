import type { CF, Env, IAppAuthenticatedRequest } from '@cmp/api/types'
import type { IThread } from '@cmp/shared/models/thread'
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import type { IRequest } from 'itty-router'
import { getUserDO } from '@cmp/api/durable-objects/UserDO'
import { defaultErrorHandler } from '@cmp/api/helpers/default-error-handler'
import { authenticateRequest, getUserIdFromAuthenticationHeader } from '@cmp/api/middleware/authenticate-request'
import { getDb, schema } from '@cmp/shared/helpers/get-db'
import { novaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { desc, eq, inArray, or, sql } from 'drizzle-orm'
import { AutoRouter, error, status } from 'itty-router'
import { z } from 'zod'

const getMessagesQueryParamsSchema = z.object({
  unread: z.coerce.boolean().optional()
})

export type GetMessageQueryParams = z.infer<typeof getMessagesQueryParamsSchema>

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/messages',
  catch: defaultErrorHandler
})
  .post('/', getUserIdFromAuthenticationHeader, async (req, env) => {
    const senderId = req.userId ?? null
    let { adId, content, unauthenticatedSender, threadId, recipient } = novaMensagemSchema.parse(await req.json())
    if (senderId === null && !unauthenticatedSender) {
      return error(400, 'sender is required')
    }
    const db = getDb(env.DB)
    const anuncio = await db.query.anuncio.findFirst({ where: (anuncio, { eq }) => eq(anuncio.id, adId) }) ?? null
    if (anuncio === null) {
      return error(404, 'anuncio nao encontrado')
    }
    else if (anuncio.status !== 'published') {
      return error(400, 'anuncio nao esta publicado')
    }
    if (recipient === undefined) {
      recipient = anuncio.userId
    }
    await env.PROCESS_AD_MESSAGE_WORKFLOW.create({ params: { senderId, message: { adId, content, unauthenticatedSender, recipient, threadId } } })
    return status(200)
  })
  .all<IRequest, CF>('*', authenticateRequest)
  .get('/', async (req, env) => {
    const user = req.user ?? null
    if (user === null) {
      return error(403, 'Unauthorized')
    }
    const params = getMessagesQueryParamsSchema.parse(req.query)
    const db = getDb(env.DB)
    const messages = await db.query.mensagem.findMany({
      where: (mensagem, { eq, and }) => {
        const filter = [eq(mensagem.recipientId, user.id)]
        if (params.unread) {
          filter.push(eq(mensagem.unread, true))
        }
        return and(...filter)
      },
      with: {
        anuncio: true,
        sender: {
          columns: {
            nomeRazaoSocial: true,
            nomeFantasia: true,
            email: true,
            celular: true,
            isCnpj: true
          }
        }
      },
      orderBy: (mensagem, { desc }) => [desc(mensagem.createdAt)]
    })
    return messages
  })
  .get('/threads', async (req, env) => {
    const user = req.user ?? null
    if (user === null) {
      return error(403, 'Unauthorized')
    }
    const db = getDb(env.DB)
    const threads: IThread[] = await db.select({
      id: schema.mensagem.threadId,
      ultimaAtualizacao: sql<Date>`MAX(${schema.mensagem.createdAt})`,
      unreadMessages: sql<number>`SUM(${schema.mensagem.unread})`,
      unauthenticatedSender: schema.mensagem.unauthenticatedSender,
      sender: {
        id: schema.usuario.id,
        nomeRazaoSocial: schema.usuario.nomeRazaoSocial,
        nomeFantasia: schema.usuario.nomeFantasia,
        isCnpj: schema.usuario.isCnpj,
        email: schema.usuario.email,
        celular: schema.usuario.celular
      },
      anuncio: {
        id: schema.anuncio.id,
        marca: schema.anuncio.marca,
        modelo: schema.anuncio.modelo,
        ano: schema.anuncio.ano,
        anoModelo: schema.anuncio.anoModelo
      }
    })
      .from(schema.mensagem)
      .where(or(eq(schema.mensagem.senderId, user.id), eq(schema.mensagem.recipientId, user.id)))
      .innerJoin(schema.anuncio, eq(schema.anuncio.id, schema.mensagem.adId))
      .leftJoin(schema.usuario, eq(schema.usuario.id, schema.mensagem.senderId))
      .groupBy(schema.mensagem.threadId)
      .orderBy(desc(schema.mensagem.createdAt))
    return threads
  })
  .get('/threads/:threadId', async (req, env, ctx) => {
    const user = req.user ?? null
    if (user === null) {
      return error(403, 'Unauthorized')
    }
    const threadId = req.params.threadId
    const db = getDb(env.DB)
    const messages: IThreadMessage[] = await db.query.mensagem.findMany({
      where: (mensagem, { eq, and, or }) => and(eq(mensagem.threadId, threadId), or(eq(mensagem.senderId, user.id), eq(mensagem.recipientId, user.id))),
      orderBy: (mensagem, { asc }) => [asc(mensagem.createdAt)],
      with: {
        sender: {
          columns: {
            id: true,
            isCnpj: true,
            nomeRazaoSocial: true,
            nomeFantasia: true,
            email: true,
            celular: true
          }
        },
        anuncio: {
          columns: {
            id: true,
            marca: true,
            modelo: true,
            anoModelo: true,
            ano: true
          }
        }
      }
    })
    const setMessagesAsRead = messages
      .reduce((accumulator: number[], message) => {
        if (message.unread && message.recipientId === user.id) {
          accumulator.push(message.id)
        }
        return accumulator
      }, [])
    if (setMessagesAsRead.length > 0) {
      ctx.waitUntil((async (userId: number) => {
        await db.update(schema.mensagem).set({ unread: false }).where(inArray(schema.mensagem.id, setMessagesAsRead))
        const stub = await getUserDO(userId, env.USER_DO)
        await stub.sendUnreadMessages()
      })(user.id))
    }
    return messages
  })
