import type { IRequest } from 'itty-router'
import type { FipeClient } from './durable-objects/fipe'
import type { AdReviewEvent } from './workflows/AdReviewWorkflow'

export interface Env {
  DB: D1Database
  CEP: KVNamespace
  FIPE_DO: DurableObjectNamespace<FipeClient>
  API_SECRET: string
  AD_IMAGES_BUCKET: R2Bucket
  AD_REVIEW_WORKFLOW: Workflow<AdReviewEvent>
}

export type CF = [env: Env, context: ExecutionContext]

export interface IAppAuthenticatedRequest extends IRequest {
  userId: number
}
