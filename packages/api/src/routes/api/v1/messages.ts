import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import type { IThread } from '@cmp/shared/models/thread'
import type { IRequest } from 'itty-router'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { authenticateRequest, getUserIdFromAuthenticationHeader } from '@/middleware/authenticate-request'
import { getDb, schema } from '@cmp/shared/helpers/get-db'
import { getNovaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { desc, eq, sql } from 'drizzle-orm'
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
    const { adId, content, unauthenticatedSender } = getNovaMensagemSchema().parse(await req.json())
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
    const recipientId = anuncio.userId
    await env.PROCESS_AD_MESSAGE_WORKFLOW.create({ params: { recipientId, senderId, message: { adId, content, unauthenticatedSender } } })
    return status(200)
  })
  .get('/', getUserIdFromAuthenticationHeader, async (req, env) => {
    const userId = req.userId ?? null
    if (userId === null) {
      return error(403, 'Unauthorized')
    }
    const params = getMessagesQueryParamsSchema.parse(req.query)
    const db = getDb(env.DB)
    const messages = await db.query.mensagem.findMany({
      where: (mensagem, { eq, and }) => {
        const filter = [eq(mensagem.recipientId, userId)]
        if (params.unread) {
          filter.push(eq(mensagem.unread, true))
        }
        return and(...filter)
      },
      with: {
        ad: true,
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
  .get('/threads', getUserIdFromAuthenticationHeader, async (req, env) => {
    const userId = req.userId ?? null
    if (userId === null) {
      return error(403, 'Unauthorized')
    }
    const db = getDb(env.DB)
    const threads: IThread[] = await db.select({
      ultimaAtualizacao: sql<Date>`max(${schema.mensagem.createdAt})`,
      unreadMessages: schema.mensagem.unread,
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
      .innerJoin(schema.anuncio, eq(schema.anuncio.id, schema.mensagem.adId))
      .leftJoin(schema.usuario, eq(schema.usuario.id, schema.mensagem.senderId))
      .groupBy(sql`json_extract(unauthenticated_sender, '$.email')`, schema.usuario.id, schema.mensagem.adId)
      .orderBy(desc(schema.mensagem.createdAt))
    return threads
  })
  .all<IRequest, CF>('*', authenticateRequest)

/*
  SELECT  mensagem.created_at, mensagem.unread, mensagem.content, mensagem.unauthenticated_sender, usuario.id as sender_id, usuario.nome_razao_social as nome, usuario.nome_fantasia as nome_fantasia, usuario.is_cnpj as sender_is_cnpj, usuario.email as sender_email, anuncio.id as ad_id, anuncio.marca, anuncio.modelo, anuncio.ano_modelo, anuncio.ano
FROM mensagem
INNER JOIN anuncio ON mensagem.ad_id = anuncio.id
LEFT JOIN usuario ON mensagem.sender_id = usuario.id
GROUP BY json_extract(unauthenticated_sender, '$.email'), sender_id, ad_id
/ */
