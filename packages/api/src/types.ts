import type { IRequest } from 'itty-router'
import type { FipeClient } from './durable-objects/fipe'

export interface Env {
  DB: D1Database
  CEP: KVNamespace
  FIPE_DO: DurableObjectNamespace<FipeClient>
  API_SECRET: string
  AD_IMAGES_BUCKET: R2Bucket
}

export type CF = [env: Env, context: ExecutionContext]

export interface IAppAuthenticatedRequest extends IRequest {
  userId: number
}
