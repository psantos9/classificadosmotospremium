import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { atualizaCadastroSchema } from '@cmp/shared/models/atualiza-cadastro'
import { cadastro, schema } from '@cmp/shared/models/database/schema'
import { passwordSchema } from '@cmp/shared/models/novo-cadastro'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { AutoRouter, error, json, StatusError } from 'itty-router'
import { z } from 'zod'

const bodyPasswordSchema = z.object({
  currentPassword: z.string(),
  password: passwordSchema
})

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
  .put('/password', async (req, env) => {
    const authenticatedUserId = req.userId
    const db = drizzle(env.DB, { schema })

    const senhas = bodyPasswordSchema.parse(await req.json())
    let cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, authenticatedUserId) }) ?? null
    if (cadastroDB === null) {
      return error(404, 'usuário não encontrado')
    }

    const passwordMatch = await bcrypt.compare(senhas.currentPassword, cadastroDB.password)
    if (!passwordMatch) {
      return error(401, 'senha inválida')
    }
    const newPassword = bcrypt.hashSync(senhas.password, 10);
    ([cadastroDB = null] = await db.update(cadastro).set({ password: newPassword }).where(eq(cadastro.id, authenticatedUserId)).returning())
    if (cadastroDB === null) {
      return error(500, 'não foi possível atualizar a senha do usuário')
    }
    return new Response(null, { status: 204 })
  })
  .put('/:userId', async (req, env) => {
    const authenticatedUserId = req.userId
    const db = drizzle(env.DB, { schema })
    const userId = z.string().uuid().parse(atob(req.params.userId))

    if (authenticatedUserId !== userId) {
      const cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, userId) }) ?? null
      if (cadastroDB === null) {
        throw new StatusError(500, 'não foi poossivel encontrar o cadastro do usuario')
      }
      else if (!cadastroDB.superadmin) {
        throw new StatusError(403)
      }
    }

    try {
      const atualizacao = atualizaCadastroSchema.parse(await req.json())
      console.log(atualizacao)
      // data de nascimento não será atualizada por razões de segurança, será considerada a data de referencia para verificações
      // o valor inserido durante a criação do cadastro
      const [cadastroDB = null] = await db.update(cadastro).set(atualizacao).where(eq(cadastro.id, userId)).returning()
      if (cadastroDB === null) {
        throw new StatusError(500, 'não foi poossivel encontrar o cadastro do usuario')
      }
      const { password, ...cadastroAtualizado } = cadastroDB
      return json(cadastroAtualizado)
    }
    catch (err) {
      if (err instanceof Error && err.message.includes('D1_ERROR')) {
        if (err.message.includes('UNIQUE constraint failed: cadastro.email')) {
          throw new StatusError(409, 'conflito:email')
        }
        else if (err.message.includes('UNIQUE constraint failed: cadastro.cpfCnpj')) {
          throw new StatusError(409, 'conflito:cpfCnpj')
        }
      }
      throw err
    }
  })
