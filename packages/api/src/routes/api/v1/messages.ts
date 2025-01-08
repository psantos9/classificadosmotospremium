import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import type { IRequest } from 'itty-router'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { authenticateRequest, getUserIdFromAuthenticationHeader } from '@/middleware/authenticate-request'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { getNovaMensagemSchema } from '@cmp/shared/models/nova-mensagem'
import { AutoRouter, error, status } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/messages',
  catch: defaultErrorHandler
})
  .post('/', getUserIdFromAuthenticationHeader, async (req, env) => {
    const senderId = req.user.id
    const mensagem = getNovaMensagemSchema().parse(await req.json())

    if (senderId === null && !mensagem.sender) {
      return error(400, 'sender is required')
    }
    const { adId } = mensagem
    const db = getDb(env.DB)
    const anuncio = await db.query.anuncio.findFirst({ where: (anuncio, { eq }) => eq(anuncio.id, adId) }) ?? null
    if (anuncio === null) {
      return error(404, 'anuncio nao encontrado')
    }
    else if (anuncio.status !== 'published') {
      return error(400, 'anuncio nao esta publicado')
    }
    await db.insert(schema.mensagem).values({ ...mensagem, senderId, recipientId: anuncio.userId }).returning()
    return status(200)
  })
  .all<IRequest, CF>('*', authenticateRequest)
