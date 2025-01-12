import type { Env, IAppAuthenticatedRequest } from '@/types'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { AtualizaAnuncio } from '@cmp/shared/models/atualiza-anuncio'
import type { Anuncio, NovoAnuncio } from '@cmp/shared/models/database/models'
import type { OpenCEP } from '@cmp/shared/models/open-cep'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { ImageService } from '@/services/image-service'
import { ALLOWED_IMAGE_MIME_TYPES as allowedImageMimeTypes } from '@cmp/shared/constants'
import { getDb } from '@cmp/shared/helpers/get-db'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { getAtualizaAnuncioSchema } from '@cmp/shared/models/atualiza-anuncio'
import { schema } from '@cmp/shared/models/database/schema'
import { and, eq, type SQL } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { AutoRouter, error, status, StatusError } from 'itty-router'
import { z } from 'zod'

const { userId, ...anuncioColumns } = getTableColumns(schema.anuncio)

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/ads',
  catch: defaultErrorHandler
})
  .get('/', async (req, env) => {
    const userId = req.user.id
    const url = new URL(req.url)
    const statusParam = (url.searchParams.get('status') ?? '') as AnuncioStatus
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId)]
    if (anuncioStatusSchema.options.includes(statusParam as AnuncioStatus)) {
      filters.push(eq(schema.anuncio.status, statusParam))
    }
    const anuncios = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters))
    return anuncios
  })
  .get('/:adId', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    const [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    return { ...anuncio, ...anuncio?.atualizacao ?? null }
  })
  .post('/', async (req, env) => {
    const { id: userId, isCnpj } = req.user
    const anuncio = getAtualizaAnuncioSchema().parse(await req.json())
    const cachedCEP = await env.CEP.get<OpenCEP>(anuncio.cep.toString(), 'json')
    const location = cachedCEP?.geometry ?? null
    const db = getDb(env.DB)
    const [row] = await db.insert(schema.anuncio).values({ ...anuncio, userId, pj: isCnpj, location }).returning()

    const novoAnuncio: Anuncio = row
    return novoAnuncio
  })
  .put('/:adId', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)
    const atualizacao = getAtualizaAnuncioSchema().parse(await req.json())
    const cachedCEP = await env.CEP.get<OpenCEP>(atualizacao.cep.toString(), 'json')
    atualizacao.location = cachedCEP?.geometry ?? null

    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    let [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }

    const update: Partial<NovoAnuncio> = anuncio.status === 'draft'
      ? { ...atualizacao, atualizacao }
      : { atualizacao }
    ;[anuncio = null] = await db.update(schema.anuncio).set(update).where(and(...filters)).limit(1).returning({ ...anuncioColumns })
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }
    return { ...anuncio, ...atualizacao }
  })
  .delete('/:adId/changes', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)

    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]

    let [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }
    else if (anuncio.atualizacao === null) {
      return status(204)
    }
    if (anuncio.reviewWorkflowId !== null) {
      try {
        const instance = await env.AD_REVIEW_WORKFLOW.get(anuncio.reviewWorkflowId)
        const status = await instance.status()
        if (!['terminated', 'complete', 'errored'].includes(status.status)) {
          await instance.terminate()
        }
      }
      catch (err) {
        console.log('error while terminating workflow', err)
        throw err
      }
    }
    ;[anuncio = null] = await db.update(schema.anuncio).set({ reviewWorkflowId: null, atualizacao: null }).where(and(...filters)).limit(1).returning({ ...anuncioColumns })
    if (anuncio === null) {
      return error(404, 'anúncio não pode ser alterado')
    }
    return anuncio
  })
  .put('/:adId/review', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)

    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]

    let [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }
    else if (anuncio.atualizacao === null) {
      return status(204)
    }
    if (anuncio.reviewWorkflowId !== null) {
      try {
        const instance = await env.AD_REVIEW_WORKFLOW.get(anuncio.reviewWorkflowId)
        const status = await instance.status()
        if (!['terminated', 'complete', 'errored'].includes(status.status)) {
          await instance.terminate()
        }
      }
      catch (err) {
        console.log('error while terminating workflow', err)
      }
    }

    const reviewWorkflowId = crypto.randomUUID()
    ;[anuncio = null] = await db.update(schema.anuncio).set({ reviewWorkflowId }).where(and(...filters)).limit(1).returning({ ...anuncioColumns })
    if (anuncio === null) {
      return error(404, 'anúncio não pode ser alterado')
    }
    await env.AD_REVIEW_WORKFLOW.create({ id: reviewWorkflowId, params: { adId } })
    return anuncio
  })
  .delete('/:adId', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    const [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }

    /*
    const adKeys = await fetchAdImageKeys({ env, adId })
    if (adKeys.length > 0) {
      await env.AD_IMAGES_BUCKET.delete(adKeys)
    }
    await db.delete(schema.anuncio).where(and(...filters))
    */
    await db.update(schema.anuncio).set({ status: 'archived' }).where(and(...filters)).limit(1)
    return status(204)
  })
  .post('/:adId/images', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)
    const contentType = req.headers.get('Content-Type')
    if (!contentType?.match(/multipart\/form-data/)) {
      throw new StatusError(415)
    }
    const db = getDb(env.DB)
    let [row = null] = await db.select().from(schema.anuncio).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1)
    if (row === null) {
      return error(404, 'não é possivel adicionar imagens ao anuncio')
    }
    const fotos = row.status === 'draft' ? row.fotos : row.atualizacao?.fotos ?? row.fotos

    const imageService = ImageService.getInstance(env)

    const formData = (await req.formData()) as FormData
    const imageIds: string[] = []
    for (const [, value] of Array.from(formData.entries())) {
      if (value as unknown instanceof File) {
        const file = value as unknown as File
        if (!allowedImageMimeTypes.includes(file.type)) {
          console.warn(`discarding file ${file.name}, mime type ${file.type} not allowed`)
          throw new StatusError(400, `mime_type_not_allowed: ${file.type}`)
        }
        const image = await imageService.upload({ adId, file })
        imageIds.push(image.fileId)
      }
    }
    const novasFotos = [...fotos, ...imageIds]
    ;[row = null] = await db.select().from(schema.anuncio).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1)
    if (row === null) {
      return error(400, 'error while uploading photos')
    }

    const { codigoFipe, marca, modelo, ano, anoModelo, quilometragem, placa, preco, aceitaTroca, cor, descricao, acessorios, informacoesAdicionais, cep, localidade, uf } = row

    const atualizacao: AtualizaAnuncio = { codigoFipe, marca, modelo, ano, anoModelo, quilometragem, placa, preco, aceitaTroca: !!aceitaTroca, cor, descricao: descricao ?? '', acessorios, informacoesAdicionais, cep, localidade, uf, fotos: novasFotos }

    const update: Partial<NovoAnuncio> = row.status === 'draft'
      ? { fotos: atualizacao.fotos, atualizacao }
      : { atualizacao }

    const [anuncio = null] = await db.update(schema.anuncio).set(update).where(and(eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId))).limit(1).returning({ ...anuncioColumns })
    if (anuncio === null) {
      return error(400, 'error while uploading photos')
    }
    return { ...anuncio, ...atualizacao }
  })
  .put('/:adId/images/delete', async (req, env) => {
    const userId = req.user.id
    const adId = z.coerce.number().parse(req.params.adId)
    const imageKeys = z.array(z.string()).parse(await req.json())
    const db = getDb(env.DB)
    const filters: SQL[] = [eq(schema.anuncio.userId, userId), eq(schema.anuncio.id, adId)]
    let [anuncio = null] = await db.select({ ...anuncioColumns }).from(schema.anuncio).where(and(...filters)).limit(1)
    if (anuncio === null) {
      return error(404, 'anúncio não encontrado')
    }

    const fotos = anuncio.status === 'draft' ? anuncio.fotos : anuncio.atualizacao?.fotos ?? anuncio.fotos
    const imagesToDelete = imageKeys.filter(imageKey => fotos.includes(imageKey))
    const imagesToKeep = fotos.filter(foto => !imagesToDelete.includes(foto))
    if (imagesToKeep.length === 0) {
      return error(400, 'o anúncio tem de ter pelo menos uma foto')
    }

    const imageService = ImageService.getInstance(env)
    await imageService.deleteMultiple(imagesToDelete)

    const { codigoFipe, marca, modelo, ano, anoModelo, quilometragem, placa, preco, aceitaTroca, cor, descricao, acessorios, informacoesAdicionais, cep, localidade, uf } = anuncio
    const atualizacao: AtualizaAnuncio = { codigoFipe, marca, modelo, ano, anoModelo, quilometragem, placa, preco, aceitaTroca: !!aceitaTroca, cor, descricao: descricao ?? '', acessorios, informacoesAdicionais, cep, localidade, uf, fotos: imagesToKeep }

    const update: Partial<NovoAnuncio> = anuncio.status === 'draft'
      ? { fotos: atualizacao.fotos, atualizacao }
      : { atualizacao }

    ;[anuncio] = await db.update(schema.anuncio).set(update).where(and(...filters)).limit(1).returning({ ...anuncioColumns })

    return { ...anuncio, ...atualizacao }
  })
