import type { Env } from '@/types'
import { getBearerToken } from '@/helpers/getBearerToken'
import { cadastro, type NovoCadastro, schema } from '@cmp/database/schema'
import { novoCadastroSchema } from '@cmp/shared/models/novo-cadastro'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { ZodError } from 'zod'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context
  const db = drizzle(env.DB)
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }

    const body = await context.request.json()
    const novoCadastro = novoCadastroSchema.parse(body)
    const password: string = bcrypt.hashSync(novoCadastro.password, 10)

    const _cadastro: NovoCadastro = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...novoCadastro,
      password
    }

    await db.insert(cadastro).values(_cadastro).returning({ userId: cadastro.id })
    const bearerToken = await getBearerToken({ email: novoCadastro.email, password: novoCadastro.password, db: env.DB, apiSecret: env.API_SECRET })

    return Response.json({ bearerToken })
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
