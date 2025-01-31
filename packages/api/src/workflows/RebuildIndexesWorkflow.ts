import type { Env } from '@cmp/api/types'
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { TypesenseService, useTypesense } from '@cmp/api/services/typesense-service'
import { getDb } from '@cmp/shared/helpers/get-db'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { schema } from '@cmp/shared/models/database/schema'
import { adsCollectionSchema, sellersCollectionSchema, type TAdDocument, type TSellerDocument, TypesenseCollection } from '@cmp/shared/models/typesense'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { eq } from 'drizzle-orm'
import { Client } from 'typesense'
import { z } from 'zod'

export const rebuildIndexesEventSchema = z.object({})
export type RebuildIndexesEvent = z.infer<typeof rebuildIndexesEventSchema>

export class RebuildIndexesWorkflow extends WorkflowEntrypoint<Env, RebuildIndexesEvent> {
  async run(event: WorkflowEvent<RebuildIndexesEvent>, step: WorkflowStep) {
    const typesense = new TypesenseService(this.env)
    const db = getDb(this.env.DB)

    const collectionNames = await step.do('get existing collections', { timeout: '10 seconds' }, async () => {
      const collectionNames = (await typesense.client.collections().retrieve()).map(({ name }) => name)
      return collectionNames
    })

    if (collectionNames.includes(TypesenseCollection.ADS)) {
      await step.do('delete ads collection', { timeout: '10 seconds' }, async () => {
        await typesense.client.collections(TypesenseCollection.ADS).delete()
      })
    }

    if (collectionNames.includes(TypesenseCollection.SELLER)) {
      await step.do('delete seller collection', { timeout: '10 seconds' }, async () => {
        await typesense.client.collections(TypesenseCollection.SELLER).delete()
      })
    }

    await step.do('create ads collection', { timeout: '10 seconds' }, async () => {
      await typesense.createAdsCollection()
    })

    await step.do('create seller collection', { timeout: '10 seconds' }, async () => {
      await typesense.createSellersCollection()
    })

    const users = await step.do('fetch users', { timeout: '30 seconds', retries: { limit: 0, delay: 0 } }, async () => {
      const users = await db.query.usuario.findMany()
      return users
    })

    await step.do('add documents to sellers collection', { timeout: '5 minutes', retries: { limit: 0, delay: 0 } }, async () => {
      const documents = users.map(typesense.mapUserToSeller)
      try {
        await typesense.client.collections(TypesenseCollection.SELLER).documents().import(documents, { action: 'upsert' })
      }
      catch (err) {
        console.error(err)
        throw new NonRetryableError('error while importing users')
      }
    })

    await step.do('add documents to ads collection', { timeout: '5 minutes', retries: { limit: 0, delay: 0 } }, async () => {
      const ads = await db.query.anuncio.findMany({
        where: (anuncio, { eq, and }) => and(eq(anuncio.status, anuncioStatusSchema.enum.published))
      })
      const documents = ads.map(typesense.mapAdToDocument)
      try {
        await typesense.client.collections(TypesenseCollection.ADS).documents().import(documents, { action: 'upsert' })
      }
      catch (err) {
        console.error(err)
        throw new NonRetryableError('error while importing ads')
      }
    })
  }
}
