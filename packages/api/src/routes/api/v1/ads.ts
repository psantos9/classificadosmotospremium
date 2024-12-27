import type { Env, IAppAuthenticatedRequest } from '@/types'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { fetchAdImageKeys } from '@/helpers/fetch-all-ads-image-keys'
import { getDb } from '@/helpers/get-db'
import { getImageStorageKey } from '@/helpers/get-image-storage-key'
import { sha256 } from '@cmp/api/helpers/shsa256'
import { ALLOWED_IMAGE_MIME_TYPES as allowedImageMimeTypes } from '@cmp/shared/constants'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { getAtualizaAnuncioSchema } from '@cmp/shared/models/atualiza-anuncio'
import { schema } from '@cmp/shared/models/database/schema'
import { and, eq, type SQL } from 'drizzle-orm'
import { AutoRouter, error, status, StatusError } from 'itty-router'
import { z } from 'zod'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/ads',
  catch: defaultErrorHandler
})
  .get('/', async (req, env) => {
    const userId = req.userId
    const url = new URL(req.url)
    const statusParam = (url.searchParams.get('status') ?? '') as AnuncioStatus
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId)]
    if (anuncioStatusSchema.options.includes(statusParam as AnuncioStatus)) {
      filters.push(eq(schema.anuncio.status, statusParam))
    }
    const anuncios = await db.select().from(schema.anuncio).where(and(...filters))
    return anuncios
  })
  .get('/:adId', async (req, env) => {
    const userId = req.userId
    const adId = z.coerce.number().parse(req.params.adId)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    const [anuncio = null] = await db.select().from(schema.anuncio).where(and(...filters)).limit(1)
    return anuncio
  })
  .post('/', async (req, env) => {
    const userId = req.userId
    const anuncio = getAtualizaAnuncioSchema().parse(await req.json())
    const db = getDb(env.DB)
    const [row] = await db.insert(schema.anuncio).values({ ...anuncio, userId }).returning()
    const novoAnuncio: Anuncio = row
    return novoAnuncio
  })
  .put('/:adId', async (req, env) => {
    const userId = req.userId
    const adId = z.coerce.number().parse(req.params.adId)
    const atualizacao = getAtualizaAnuncioSchema().parse(await req.json())
    const db = getDb(env.DB)
    const [row = null] = await db.update(schema.anuncio).set({ ...atualizacao }).where(and(eq(schema.anuncio.id, adId), eq(schema.anuncio.userId, userId))).limit(1).returning()
    const novoAnuncio: Anuncio | null = row
    return novoAnuncio === null ? error(404, 'anúncio não encontrado') : novoAnuncio
  })
  .delete('/:adId', async (req, env) => {
    const userId = req.userId
    const adId = z.coerce.number().parse(req.params.adId)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    const [anuncio = null] = await db.select().from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }
    else if (anuncio.status !== anuncioStatusSchema.enum.draft) {
      return error(400, 'só é possível deletar anúncios com o status draft')
    }
    const adKeys = await fetchAdImageKeys({ env, adId })
    if (adKeys.length > 0) {
      await env.AD_IMAGES_BUCKET.delete(adKeys)
    }
    await db.delete(schema.anuncio).where(and(...filters))
    return status(204)
  })
  .post('/:adId/images', async (req, env) => {
    const userId = req.userId
    const adId = z.coerce.number().parse(req.params.adId)
    const contentType = req.headers.get('Content-Type')
    if (!contentType?.match(/multipart\/form-data/)) {
      throw new StatusError(415)
    }
    const db = getDb(env.DB)
    const [row = null] = await db.select({ fotos: schema.anuncio.fotos }).from(schema.anuncio).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1)
    if (row === null) {
      return error(404, 'não é possivel adicionar imagens ao anuncio')
    }
    const { fotos } = row

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
          const storageKey = getImageStorageKey({ adId, sha256: hash })
          if (await env.AD_IMAGES_BUCKET.head(storageKey) === null) {
            await env.AD_IMAGES_BUCKET.put(storageKey, await file.arrayBuffer(), {
              sha256: hash,
              httpMetadata: { contentType: type }
            })
          }
          if (!fotos.includes(storageKey)) {
            r2Keys.push(storageKey)
          }
        }
      }
    }
    const novasFotos = Array.from(new Set([...fotos, ...r2Keys]))
    const [anuncio = null] = await db.update(schema.anuncio).set({ fotos: novasFotos }).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1).returning()
    return anuncio
  })
  .delete('/:adId/images/:imageKey', async (req, env) => {
    const userId = req.userId
    const adId = z.coerce.number().parse(req.params.adId)
    const imageKey = z.string().parse(req.params.imageKey)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    let [anuncio = null] = await db.select().from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }
    else if (anuncio.fotos.length === 1) {
      return error(400, 'o anúncio tem de ter pelo menos uma foto')
    }

    if (await env.AD_IMAGES_BUCKET.head(atob(imageKey)) !== null) {
      await env.AD_IMAGES_BUCKET.delete(atob(imageKey))
    }
    const idx = anuncio.fotos.indexOf(imageKey)
    if (idx < 0) {
      return anuncio
    }
    else {
      anuncio.fotos.splice(idx, 1)
      ;[anuncio] = await db.update(schema.anuncio).set({ fotos: anuncio.fotos }).where(and(...filters)).limit(1).returning()
    }
    return anuncio
  })
