import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { schema } from '@cmp/shared/models/database/schema'
import { drizzle } from 'drizzle-orm/d1'
import { AutoRouter, type IRequest, json, type RequestHandler, StatusError } from 'itty-router'
import { z } from 'zod'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/user',
  catch: defaultErrorHandler
})
  .get('/:userId?', async (req, env) => {
    const authenticatedUserId = req.userId
    const db = drizzle(env.DB, { schema })
    const userId = req.params.userId ? z.string().uuid().parse(atob(req.params.userId)) : authenticatedUserId

    if (authenticatedUserId !== userId) {
      const cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, userId) }) ?? null
      if (cadastroDB === null) {
        throw new StatusError(500, 'não foi poossivel encontrar o cadastro do usuario')
      }
      else if (!cadastroDB.superadmin) {
        throw new StatusError(403)
      }
    }

    const cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, userId) }) ?? null
    if (cadastroDB === null) {
      throw new StatusError(500, 'não foi possível encontrar o cadastro do usuário')
    }
    const { password, ...cadastro } = cadastroDB
    return json(cadastro)
  })
