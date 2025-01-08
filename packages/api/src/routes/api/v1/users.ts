import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { getDb } from '@cmp/shared/helpers/get-db'
import { atualizaUsuarioSchema } from '@cmp/shared/models/atualiza-usuario'
import { schema } from '@cmp/shared/models/database/schema'
import { passwordSchema } from '@cmp/shared/models/novo-usuario'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { AutoRouter, error, json, StatusError } from 'itty-router'
import { z } from 'zod'

const bodyPasswordSchema = z.object({
  currentPassword: z.string(),
  password: passwordSchema
})

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/users',
  catch: defaultErrorHandler
})
  .get('/:userId?', async (req, env) => {
    const authenticatedUserId = req.user.id
    const db = getDb(env.DB)
    const userId = req.params.userId ? z.coerce.number().parse(req.params.userId) : authenticatedUserId

    if (authenticatedUserId !== userId) {
      await db.query
      const userDB = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.id, userId) }) ?? null
      if (userDB === null) {
        throw new StatusError(500, 'não foi poossivel encontrar o usuario do usuario')
      }
      else if (!userDB.superadmin) {
        throw new StatusError(403)
      }
    }

    const usuarioDB = await db.query.usuario.findFirst({ where: (usuario, { eq }) => eq(usuario.id, userId) }) ?? null
    if (usuarioDB === null) {
      throw new StatusError(500, 'não foi possível encontrar o usuario do usuário')
    }
    const { password, ...usuario } = usuarioDB
    return json(usuario)
  })
  .put('/password', async (req, env) => {
    const authenticatedUserId = req.user.id
    const db = getDb(env.DB)

    const senhas = bodyPasswordSchema.parse(await req.json())

    const passwordMatch = await bcrypt.compare(senhas.currentPassword, req.user.password)
    if (!passwordMatch) {
      return error(401, 'senha inválida')
    }
    const newPassword = bcrypt.hashSync(senhas.password, 10)
    const [userDB = null] = await db.update(schema.usuario).set({ password: newPassword }).where(eq(schema.usuario.id, authenticatedUserId)).returning()
    if (userDB === null) {
      return error(500, 'não foi possível atualizar a senha do usuário')
    }
    return new Response(null, { status: 204 })
  })
  .put('/:userId', async (req, env) => {
    const authenticatedUserId = req.user.id
    const db = getDb(env.DB)
    const userId = z.coerce.number().parse(req.params.userId)

    if (authenticatedUserId !== userId && !req.user.superadmin) {
      throw new StatusError(403)
    }

    try {
      const atualizacao = atualizaUsuarioSchema.parse(await req.json())
      const [usuarioDB = null] = await db.update(schema.usuario).set(atualizacao).where(eq(schema.usuario.id, userId)).returning()
      if (usuarioDB === null) {
        throw new StatusError(500, 'não foi possivel encontrar o usuario')
      }
      const { password, ...usuarioAtualizado } = usuarioDB
      return json(usuarioAtualizado)
    }
    catch (err) {
      if (err instanceof Error && err.message.includes('D1_ERROR')) {
        if (err.message.includes('UNIQUE constraint failed: usuario.email')) {
          throw new StatusError(409, 'conflito:email')
        }
        else if (err.message.includes('UNIQUE constraint failed: usuario.cpfCnpj')) {
          throw new StatusError(409, 'conflito:cpfCnpj')
        }
      }
      throw err
    }
  })
