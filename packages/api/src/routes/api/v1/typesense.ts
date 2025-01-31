import type { Env, IAppAuthenticatedRequest } from '@/types'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { TypesenseService } from '@/services/typesense-service'
import { getDb } from '@cmp/shared/helpers/get-db'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { TypesenseCollection } from '@cmp/shared/models/typesense'
import { AutoRouter, error, status } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/typesense',
  catch: defaultErrorHandler
})
  .post('/rebuild', async (req, env) => {
    if (!req.user.superadmin) {
      return error(403)
    }
    const typesense = new TypesenseService(env)
    const db = getDb(env.DB)

    const collectionNames = (await typesense.client.collections().retrieve()).map(({ name }) => name)
    if (collectionNames.includes(TypesenseCollection.ADS)) {
      await typesense.client.collections(TypesenseCollection.ADS).delete()
    }

    if (collectionNames.includes(TypesenseCollection.SELLER)) {
      await typesense.client.collections(TypesenseCollection.SELLER).delete()
    }

    await typesense.createAdsCollection()
    await typesense.createSellersCollection()
    const users = await db.query.usuario.findMany()
    await typesense.client.collections(TypesenseCollection.SELLER).documents().import(users.map(typesense.mapUserToSeller), { action: 'upsert' })

    const ads = await db.query.anuncio.findMany({
      where: (anuncio, { eq, and }) => and(eq(anuncio.status, anuncioStatusSchema.enum.published))
    })
    await typesense.client.collections(TypesenseCollection.ADS).documents().import(ads.map(typesense.mapAdToDocument), { action: 'upsert' })
    return status(200)
    /* const jobId = await env.REBUILD_INDEXES_WORKFLOW.create()
    return { jobId }
    */
  })
