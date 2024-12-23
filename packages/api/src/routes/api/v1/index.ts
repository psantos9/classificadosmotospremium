import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import { getBearerToken } from '@/helpers/getBearerToken'
import { authenticateRequest } from '@/middleware/authenticate-request'
import { cadastro, type NovoCadastro, schema } from '@cmp/shared/models/database/schema'
import { novoCadastroSchema } from '@cmp/shared/models/novo-cadastro'
import { type OpenCEP, openCEPSchema } from '@cmp/shared/models/open-cep'
import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { AutoRouter, type IRequest, json, StatusError } from 'itty-router'
import { z, ZodError } from 'zod'
import { router as fipeRouter } from './fipe'
import { router as userRouter } from './user'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const cepSchema = z.string().transform(val => Number.parseInt(val.replace(/\D+/g, ''))).refine(val => val.toString().length === 8)

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: '/api/v1' })
  .get<IRequest, [Env, ExecutionContext]>('/healthcheck', () => {
    return json({ ok: true })
  })
  .get<IRequest, [Env, ExecutionContext]>('/cep/:cep', async (req, env) => {
    try {
      const cep = cepSchema.parse(req.params.cep as string)
      const cached = await env.CEP.get<OpenCEP>(cep.toString(), 'json')
      if (cached !== null) {
        return Response.json(cached)
      }
      const response = await fetch(`https://opencep.com/v1/${cep}`)
      if (response.status === 404) {
        throw new StatusError(404, 'CEP inválido')
      }
      else if (!response.ok) {
        throw new StatusError(500, 'Erro ao buscar o CEP')
      }
      const cepResult = openCEPSchema.parse(await response.json())
      await env.CEP.put(cep.toString(), JSON.stringify(cepResult))
      return json(cepResult)
    }
    catch (err) {
      if (err instanceof ZodError) {
        throw new StatusError(404, 'CEP inválido')
      }
      else { throw err }
    }
  })
  .post<IRequest, [Env, ExecutionContext]>('/login/check', async (req, env) => {
    const db = drizzle(env.DB, { schema })

    const bodySchema = z.object({ email: z.string().email() })
    try {
      const { email } = bodySchema.parse(await req.json())
      const { isExist } = await db.get<{ isExist: number }>(sql`SELECT EXISTS (SELECT 1 from ${cadastro} where ${cadastro.email} = ${email}) as isExist`)
      return json({ exists: isExist === 1 })
    }
    catch (err) {
      if (err instanceof ZodError) {
        throw new StatusError(400, err.issues)
      }
      else { throw err }
    }
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
  .all<IRequest, CF>('*', authenticateRequest)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/fipe/*', fipeRouter.fetch)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/user/*', userRouter.fetch)
export default router
