import type { ContextData, Env } from '@/types'
import { schema } from '@cmp/database/schema'
import { drizzle } from 'drizzle-orm/d1'

export const onRequestGet: PagesFunction<Env, any, ContextData> = async (context) => {
  const userId = context.data.userId ?? null
  if (userId === null) {
    return new Response(null, { status: 401 })
  }
  const db = drizzle(context.env.DB, { schema })
  const cadastroDB = await db.query.cadastro.findFirst({ where: (cadastro, { eq }) => eq(cadastro.id, userId) }) ?? null
  if (cadastroDB === null) {
    return Response.json({ status: 500, error: 'nao foi possivel encontrar o cadastro do usuario' }, { status: 500 })
  }
  const { password, ...cadastro } = cadastroDB
  return Response.json(cadastro)
}
