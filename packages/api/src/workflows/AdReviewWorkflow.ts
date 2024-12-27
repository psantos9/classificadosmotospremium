import type { Env } from '@/types'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getDb } from '@/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const adReviewEventSchema = z.object({ adId: z.number() })
export type AdReviewEvent = z.infer<typeof adReviewEventSchema>

export class AdReviewWorkflow extends WorkflowEntrypoint<Env, AdReviewEvent> {
  async run(event: WorkflowEvent<AdReviewEvent>, step: WorkflowStep) {
    let ad = await step.do('get ad', async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      const [ad = null] = await db.select().from(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
      return ad
    })
    console.log('got ad', ad?.id, ad?.status)
    console.log('sleeping for 5 mins...')
    await step.sleep('sleep for a bit', '1 minute')
    console.log('publishing ad...')
    ad = await step.do('publish ad', async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      const [ad] = await db.update(schema.anuncio).set({ publishedAt: new Date(), status: 'published' }).where(eq(schema.anuncio.id, adId)).limit(1).returning()
      return ad
    })
    console.log('published ad!', ad.id, ad.status)
  }
}
