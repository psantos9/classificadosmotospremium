import { schema } from '@cmp/shared/models/database/schema'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { SignJWT } from 'jose'

export const TOKEN_ISSUER = 'classificados-motos-premium'
export const MAX_TOKEN_AGE = '1 hour'

export const getBearerToken = async (params: { email: string, password: string, db: D1Database, apiSecret: string }): Promise<string | null> => {
  const { email, password, apiSecret } = params
  const db = drizzle(params.db, { schema })
  const usuario = await db.query.usuario.findFirst({ columns: { id: true, password: true }, where: (usuario, { eq }) => eq(usuario.email, email) }) ?? null
  if (usuario === null || await bcrypt.compare(password, usuario.password) === false) {
    return null
  }

  const bearerToken = await new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setSubject(usuario.id.toString())
    .setExpirationTime(MAX_TOKEN_AGE)
    .sign(new TextEncoder().encode(apiSecret))
  return bearerToken
}
