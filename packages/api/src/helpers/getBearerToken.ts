import { schema } from '@cmp/shared/models/database/schema'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { SignJWT } from 'jose'

export const TOKEN_ISSUER = 'classificados-motos-premium'
export const MAX_TOKEN_AGE = '1 hour'

export const getBearerToken = async (params: { email: string, password: string, db: D1Database, apiSecret: string }): Promise<string | null> => {
  const { email, password, apiSecret } = params
  const db = drizzle(params.db, { schema })
  const cadastro = await db.query.cadastro.findFirst({ columns: { id: true, password: true }, where: (cadastro, { eq }) => eq(cadastro.email, email) }) ?? null
  if (cadastro === null || await bcrypt.compare(password, cadastro.password) === false) {
    return null
  }

  const bearerToken = await new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setSubject(cadastro.id)
    .setExpirationTime(MAX_TOKEN_AGE)
    .sign(new TextEncoder().encode(apiSecret))
  return bearerToken
}
