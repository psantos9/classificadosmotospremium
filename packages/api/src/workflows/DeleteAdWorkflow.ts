import type { Env } from '@cmp/api/types'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { getImageService } from '@/services/image-service'
import { useTypesense } from '@cmp/api/services/typesense-service'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const deleteAdEventSchema = z.object({ adId: z.number() })
export type DeleteAdEvent = z.infer<typeof deleteAdEventSchema>

export class DeleteAdWorkflow extends WorkflowEntrypoint<Env, DeleteAdEvent > {
  async run(event: WorkflowEvent<DeleteAdEvent>, step: WorkflowStep) {
    const adId = event.payload.adId
    await step.do('delete add from database', { timeout: '10 seconds' }, async () => {
      const db = getDb(this.env.DB)
      await db.delete(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
    })

    await step.do('delete document', { timeout: '10 seconds', retries: { limit: 0, delay: 1000 } }, async () => {
      const typesense = await useTypesense(this.env)
      await typesense.deleteAdDocument(adId)
    })

    await step.do('delete images', { timeout: '10 seconds' }, async () => {
      const imageService = getImageService(this.env)
      await imageService.deleteAdFolder(adId)
    })
  }
}
