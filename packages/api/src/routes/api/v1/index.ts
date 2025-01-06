import type { CF, Env, IAppAuthenticatedRequest } from '@/types'
import type { SQL } from 'drizzle-orm'
import { getUsersDO } from '@/durable-objects/UsersDO'
import { getBearerToken } from '@/helpers/getBearerToken'
import { authenticateRequest } from '@/middleware/authenticate-request'
import { router as adsRouter } from '@cmp/api/routes/api/v1/ads'
import { router as fipeRouter } from '@cmp/api/routes/api/v1/fipe'
import { router as imagesRouter } from '@cmp/api/routes/api/v1/images'
import { router as messagesRouter } from '@cmp/api/routes/api/v1/messages'
import { router as usersRouter } from '@cmp/api/routes/api/v1/users'
import { router as wsRouter } from '@cmp/api/routes/api/v1/ws'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { novoUsuarioSchema } from '@cmp/shared/models/novo-usuario'
import { type OpenCEP, openCEPSchema } from '@cmp/shared/models/open-cep'
import bcrypt from 'bcryptjs'
import { and, eq, sql } from 'drizzle-orm'
import { AutoRouter, error, type IRequest, json, StatusError } from 'itty-router'
import { z, ZodError } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const cepSchema = z.string().transform(val => val.replace(/\D+/g, '')).refine(val => val.length === 8)

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
  // FIXME: REMOVE
  .get<IRequest, [Env, ExecutionContext]>('/online', async (req, env) => {
    const usersDO = getUsersDO(env)
    return usersDO.onlineUsersIndex
  })
  .post<IRequest, [Env, ExecutionContext]>('/login/check', async (req, env) => {
    const db = getDb(env.DB)

    const bodySchema = z.object({ email: z.string().email() })
    try {
      const { email } = bodySchema.parse(await req.json())
      const { isExist } = await db.get<{ isExist: number }>(sql`SELECT EXISTS (SELECT 1 from ${schema.usuario} where ${schema.usuario.email} = ${email}) as isExist`)
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
    const db = getDb(env.DB)
    try {
      const novoUsuario = novoUsuarioSchema.parse(await req.json())
      const password: string = bcrypt.hashSync(novoUsuario.password, 10)

      await db.insert(schema.usuario).values({ ...novoUsuario, password }).returning({ userId: schema.usuario.id })
      const bearerToken = await getBearerToken({ email: novoUsuario.email, password: novoUsuario.password, db: env.DB, apiSecret: env.API_SECRET })
      return json({ bearerToken })
    }
    catch (err) {
      if (err instanceof ZodError) {
        return Response.json({ status: 400, error: err.issues }, { status: 400 })
      }
      else if (err instanceof Error && err.message.includes('D1_ERROR')) {
        if (err.message.includes('UNIQUE constraint failed: usuario.email')) {
          return Response.json({ status: 409, error: 'conflito:email' }, { status: 409 })
        }
        else if (err.message.includes('UNIQUE constraint failed: usuario.cpfCnpj')) {
          return Response.json({ status: 409, error: 'conflito:cpfCnpj' }, { status: 409 })
        }
        throw err
      }
      else { throw err }
    }
  })
  .get<IRequest, [Env, ExecutionContext]>('/informacoes-adicionais', async (req, env) => {
    const db = getDb(env.DB)
    const informacoesAdicionais = await db.query.informacaoAdicional.findMany()
    return informacoesAdicionais
  })
  .get<IRequest, [Env, ExecutionContext]>('/acessorios', async (req, env) => {
    const db = getDb(env.DB)
    const acessorios = await db.query.acessorio.findMany()
    return acessorios
  })
  .get<IRequest, [Env, ExecutionContext]>('/cores', async (req, env) => {
    const db = getDb(env.DB)
    const cores = await db.query.cor.findMany()
    return cores
  })
  .get<IRequest, [Env, ExecutionContext]>('/anuncios', async (req, env) => {
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.status, 'published')]
    const anuncios = await db.query.anuncio.findMany({
      where: and(...filters),
      columns: {
        reviewWorkflowId: false,
        atualizacao: false,
        revision: false,
        placa: false,
        status: false
      },
      with: {
        cor: true,
        usuario: {
          columns: {
            createdAt: true,
            nomeFantasia: true,
            nomeRazaoSocial: true,
            cep: true,
            localidade: true,
            uf: true
          }
        }
      }
    })
    return anuncios
  })
  .get<IRequest, [Env, ExecutionContext]>('/anuncios/:id', async (req, env) => {
    const id = z.coerce.number().int().parse(req.params.id)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.status, 'published'), eq(schema.anuncio.id, id)]
    const anuncio = await db.query.anuncio.findFirst({
      where: and(...filters),
      columns: {
        reviewWorkflowId: false,
        atualizacao: false,
        revision: false,
        placa: false,
        status: false
      },
      with: {
        cor: true,
        usuario: {
          columns: {
            createdAt: true,
            nomeFantasia: true,
            nomeRazaoSocial: true,
            cep: true,
            localidade: true,
            uf: true
          }
        }
      }
    }) ?? null
    if (anuncio === null) {
      return error(404, 'anuncio nao encontrado')
    }
    return anuncio
  })
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/images/*', imagesRouter.fetch)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/messages/*', messagesRouter.fetch)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/ws/*', wsRouter.fetch)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/fipe/*', fipeRouter.fetch)
  .all<IRequest, CF>('*', authenticateRequest)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/users/*', usersRouter.fetch)
  .all<IRequest, [Env, IAppAuthenticatedRequest]>('/ads/*', adsRouter.fetch)
export default router
