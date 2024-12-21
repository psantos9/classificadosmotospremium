import type { Env } from '@/types'
import { cadastro, schema } from '@cmp/database/schema'
import { atualizaCadastroSchema } from '@cmp/shared/models/atualiza-cadastro'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z, ZodError } from 'zod'

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, params } = context
  const id = z.string().uuid().parse(atob(params.id as string))
  const db = drizzle(env.DB, { schema })
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }

    const body = await context.request.json()
    const atualizacao = atualizaCadastroSchema.parse(body)
    const [cadastroDB = null] = await db.update(cadastro).set(atualizacao).where(eq(cadastro.id, id)).returning()
    if (cadastroDB === null) {
      return Response.json({ status: 500, error: 'nao foi possivel encontrar o cadastro do usuario' }, { status: 500 })
    }
    const { password, ...cadastroAtualizado } = cadastroDB
    return Response.json(cadastroAtualizado)
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else if (err instanceof Error && err.message.includes('D1_ERROR')) {
      if (err.message.includes('UNIQUE constraint failed: cadastro.email')) {
        return Response.json({ status: 409, error: 'conflito:email' }, { status: 409 })
      }
      else if (err.message.includes('UNIQUE constraint failed: cadastro.cpfCnpj')) {
        return Response.json({ status: 409, error: 'conflito:cpfCnpj' }, { status: 409 })
      }
      throw err
    }
    else { throw err }
  }
}
