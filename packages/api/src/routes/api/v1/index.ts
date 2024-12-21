import type { Env } from '@/types'
import { getBearerToken } from '@/helpers/getBearerToken'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { AutoRouter, type IRequest, json, StatusError } from 'itty-router'
import { z, ZodError } from 'zod'
import { cadastro, type NovoCadastro, schema } from '../../../../../database/src/schema'
import { novoCadastroSchema } from '../../../../../shared/src/models/novo-cadastro'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: '/api/v1' })
  .get<IRequest, [Env, ExecutionContext]>('/healthcheck', () => {
    return json({ ok: true })
  })
  .post<IRequest, [Env, ExecutionContext]>('/login', async (req, env) => {
    try {
      const { email, password } = loginSchema.parse(await req.json())
      const bearerToken = await getBearerToken({ email, password, db: env.DB, apiSecret: env.API_SECRET })
      if (bearerToken === null) {
        throw new StatusError(401)
      }
      return json({ bearerToken })
    }
    catch (err) {
      if (err instanceof ZodError) {
        throw new StatusError(400, err.issues)
      }
      throw err
    }
  })
  .post<IRequest, [Env, ExecutionContext]>('/signup', async (req, env) => {
    const db = drizzle(env.DB, { schema })
    try {
      const novoCadastro = novoCadastroSchema.parse(await req.json())
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
      return json({ bearerToken })
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
  })
export default router
