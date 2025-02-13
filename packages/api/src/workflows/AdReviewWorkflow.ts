import type { Env } from '@cmp/api/types'
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { useTypesense } from '@cmp/api/services/typesense-service'
import { getDb } from '@cmp/shared/helpers/get-db'
import { schema } from '@cmp/shared/models/database/schema'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const adReviewEventSchema = z.object({ adId: z.number() })
export type AdReviewEvent = z.infer<typeof adReviewEventSchema>

export class AdReviewWorkflow extends WorkflowEntrypoint<Env, AdReviewEvent> {
  async run(event: WorkflowEvent<AdReviewEvent>, step: WorkflowStep) {
    await step.do('get ad', { timeout: '10 seconds' }, async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      const [ad = null] = await db.select().from(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }
      return ad
    })

    const ad = await step.do('publish ad', { timeout: '10 seconds' }, async () => {
      const adId = event.payload.adId
      const db = getDb(this.env.DB)
      let [ad = null] = await db.select().from(schema.anuncio).where(eq(schema.anuncio.id, adId)).limit(1)
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }

      const anuncio = JSON.parse(JSON.stringify(ad)) as Anuncio
      const { revision, atualizacao } = anuncio
      const update: Partial<Anuncio> = {
        ...(atualizacao ?? {}),
        revision: revision + 1,
        status: 'published',
        publishedAt: ad.publishedAt ?? new Date(),
        atualizacao: null,
        reviewWorkflowId: null
      }

      ;[ad] = await db.update(schema.anuncio).set(update).where(eq(schema.anuncio.id, adId)).limit(1).returning()
      if (ad === null) {
        throw new NonRetryableError(`ad not found: ${adId}`)
      }
      return ad
    })

    const document = await step.do('upsert ad document', { timeout: '10 seconds', retries: { limit: 0, delay: 1000 } }, async () => {
      const typesense = await useTypesense(this.env)
      const document = await typesense.upsertAd(ad)
      return document
    })

    await step.do('send email to support', { timeout: '10 seconds', retries: { limit: 0, delay: '0 seconds' } }, async () => {
      if (!this.env.POSTMARK_API_TOKEN) {
        throw new NonRetryableError('Can not send emails, POSTMARK_API_TOKEN secret is not defined!')
      }
      const { id, marca, modelo, localidade, uf } = document

      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.env.POSTMARK_API_TOKEN
        },
        body: JSON.stringify({
          From: 'Classificados Motos Premium <contato@classificadosmotospremium.com.br>',
          To: 'contato@classificadosmotospremium.com.br',
          Bcc: 'paulo@classificadosmotospremium.com.br',
          Subject: `Atualização anúncio ${id} - ${marca} ${modelo}`,
          HtmlBody: `<div>
<p>
O Anúncio <a href="https://classificadosmotospremium.com.br/anuncio/${id}">${marca} ${modelo} / ${localidade} ${uf}</a> foi atualizado!
</p>
<p>
<a href="classificadosmotospremium.com.br">Classificados Motos Premium</a>
</p>
</div>`
        })
      })

      if (response.status !== 200) {
        const body = await response.json()
        throw new NonRetryableError(`${response.status}: ${JSON.stringify(body)}`)
      }
    })
  }
}
