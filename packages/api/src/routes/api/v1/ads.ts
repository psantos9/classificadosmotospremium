import type { Env, IAppAuthenticatedRequest } from '@/types'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { getImageStorageKey } from '@/helpers/get-image-storage-key'
import { sha256 } from '@cmp/api/helpers/shsa256'
import { ALLOWED_IMAGE_MIME_TYPES as allowedImageMimeTypes } from '@cmp/shared/constants'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { getAtualizaAnuncioSchema } from '@cmp/shared/models/atualiza-anuncio'
import { schema } from '@cmp/shared/models/database/schema'
import { and, eq, sql, type SQL } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'

import { AutoRouter, error, StatusError } from 'itty-router'
import { z } from 'zod'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/ads',
  catch: defaultErrorHandler
})
  .get('/', async (req, env) => {
    const userId = req.userId
    const url = new URL(req.url)
    const statusParam = (url.searchParams.get('status') ?? '') as AnuncioStatus
    const db = drizzle(env.DB, { schema })
    const filters: SQL[] = [eq(schema.anuncio.userId, userId)]
    if (anuncioStatusSchema.options.includes(statusParam as AnuncioStatus)) {
      filters.push(eq(schema.anuncio.status, statusParam))
    }
    const anuncios = await db.select().from(schema.anuncio).where(and(...filters))
    return anuncios
  })
  .get('/:b64AdId', async (req, env) => {
    const userId = req.userId
    const adId = z.string().uuid().parse(atob(req.params.b64AdId))
    const db = drizzle(env.DB, { schema })
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    const [anuncio = null] = await db.select().from(schema.anuncio).where(and(...filters)).limit(1)
    return anuncio
  })
  .post('/', async (req, env) => {
    const userId = req.userId
    const anuncio = getAtualizaAnuncioSchema().parse(await req.json())
    const db = drizzle(env.DB, { schema })
    const [row] = await db.insert(schema.anuncio).values({ ...anuncio, userId }).returning()
    const novoAnuncio: Anuncio = row
    return novoAnuncio
  })
  .put('/:b64AdId', async (req, env) => {
    const userId = req.userId
    const adId = z.string().uuid().parse(atob(req.params.b64AdId))
    const atualizacao = getAtualizaAnuncioSchema().parse(await req.json())
    const db = drizzle(env.DB, { schema })
    const [row = null] = await db.update(schema.anuncio).set({ ...atualizacao }).where(and(eq(schema.anuncio.id, adId), eq(schema.anuncio.userId, userId))).limit(1).returning()
    const novoAnuncio: Anuncio | null = row
    return novoAnuncio === null ? error(404, 'anúncio não encontrado') : novoAnuncio
  })
  .post('/:b64AdId/images', async (req, env) => {
    const userId = req.userId
    const adId = z.string().uuid('bad adId').parse(atob(req.params.b64AdId))
    const contentType = req.headers.get('Content-Type')
    if (!contentType?.match(/multipart\/form-data/)) {
      throw new StatusError(415)
    }
    const db = drizzle(env.DB, { schema })
    const { isExist } = await db.get<{ isExist: number }>(sql`SELECT EXISTS (SELECT 1 FROM ${schema.anuncio} WHERE ${schema.anuncio.id} = ${adId} AND ${schema.anuncio.userId} = ${userId} AND ${schema.anuncio.status} = ${anuncioStatusSchema.enum.draft}) as isExist`)

    if (isExist === 0) {
      return error(404, 'não é possivel adicionar imagens ao anuncio')
    }
    const formData = (await req.formData()) as FormData
    const r2Keys: string[] = []
    for (const [key, value] of Array.from(formData.entries())) {
      const file = value as unknown
      const [, type, i] = key.match(/(\w+)\[(\d+)\]/) ?? []
      const idx = Number.parseInt(i)
      if (!Number.isNaN(idx)) {
        if (type === 'file' && file instanceof File) {
          if (!allowedImageMimeTypes.includes(file.type)) {
            console.warn(`discarding file ${file.name}, mime type ${file.type} not allowed`)
            throw new StatusError(400, `mime_type_not_allowed: ${file.type}`)
          }
          const { type } = file
          const hash = await sha256(file)
          const storageKey = getImageStorageKey({ userId, adId, sha256: hash })
          const obj = await env.AD_IMAGES_BUCKET.put(storageKey, await file.arrayBuffer(), {
            sha256: hash,
            httpMetadata: { contentType: type }
          })

          r2Keys.push(btoa(obj.key))
        }
      }
    }

    const [row = null] = await db.select({ fotos: schema.anuncio.fotos }).from(schema.anuncio).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1)
    if (row === null) {
      return error(500, 'nao foi possivel armazenar as fotos')
    }
    const { fotos } = row
    const novasFotos = Array.from(new Set([...fotos, ...r2Keys]))
    const [anuncio = null] = await db.update(schema.anuncio).set({ fotos: novasFotos }).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1).returning()
    return anuncio
  })
