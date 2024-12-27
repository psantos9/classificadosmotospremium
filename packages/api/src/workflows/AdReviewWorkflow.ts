import type { Env } from '@/types'
import type { Anuncio } from '@cmp/shared/models/database/schema'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getDb } from '@/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const adReviewEventSchema = z.object({ adId: z.number() })
export type AdReviewEvent = z.infer<typeof adReviewEventSchema>

export class AdReviewWorkflow extends WorkflowEntrypoint<Env, AdReviewEvent> {
  async run(event: WorkflowEvent<AdReviewEvent>, step: WorkflowStep) {
    await step.do('get ad', async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      const [ad = null] = await db.select().from(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }
    })
    await step.sleep('sleep for a bit', '5 second')
    await step.do('publish ad', async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      let [ad = null] = await db.select().from(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }
      const { atualizacao, status, publishedAt } = ad
      const fotos = atualizacao?.fotos ?? ad.fotos
      const update: Partial<Anuncio> = {
        ...(atualizacao ?? {}),
        fotos,
        status: status === 'draft' ? 'published' : status,
        publishedAt: publishedAt ?? new Date(),
        atualizacao: null,
        reviewWorkflowId: null
      }
        ;[ad] = await db.update(schema.anuncio).set(update).where(eq(schema.anuncio.id, adId)).limit(1).returning()
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }
    })
  }
}
