import type { ContextData, Env } from '@/types'
import { getBearerToken } from '@/helpers/getBearerToken'
import { cadastro, type NovoCadastro, schema } from '@cmp/database/schema'
import { passwordSchema } from '@cmp/shared/models/novo-cadastro'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z, ZodError } from 'zod'

const bodySchema = z.object({
  currentPassword: z.string(),
  password: passwordSchema
})

export const onRequestPut: PagesFunction<Env, any, ContextData> = async (context) => {
  const { env, data } = context
  const userId = data.userId ?? null
  if (userId === null) {
    return new Response(null, { status: 201 })
  }

  const db = drizzle(env.DB, { schema })
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }

    const senhas = bodySchema.parse(await context.request.json())

    let cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, userId) }) ?? null
    if (cadastroDB === null) {
      return Response.json({ status: 404, error: 'cadastro não encontrado' }, { status: 404 })
    }
    const passwordMatch = await bcrypt.compare(senhas.currentPassword, cadastroDB.password)
    if (!passwordMatch) {
      return Response.json({ status: 401, error: 'senha inválida' }, { status: 401 })
    }
    const newPassword = bcrypt.hashSync(senhas.password, 10)
    ;([cadastroDB = null] = await db.update(cadastro).set({ password: newPassword }).where(eq(cadastro.id, userId)).returning())
    if (cadastroDB === null) {
      return Response.json({ status: 500, error: 'nao foi possivel atualizar o senha do usuario' }, { status: 500 })
    }
    return new Response(null, { status: 204 })
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else { throw err }
  }
}
