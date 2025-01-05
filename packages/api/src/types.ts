import type { IRequest } from 'itty-router'
import type { FipeClient } from './durable-objects/fipe'
import type { UserDO } from './durable-objects/UserDO'
import type { AdReviewEvent } from './workflows/AdReviewWorkflow'

export interface Env {
  DB: D1Database
  CEP: KVNamespace
  SOCKET_AUTH: KVNamespace
  FIPE_DO: DurableObjectNamespace<FipeClient>
  USER_DO: DurableObjectNamespace<UserDO>
  ENVIRONMENT: string
  API_SECRET: string
  IMAGEKIT_PRIVATE_KEY: string
  IMAGEKIT_URL_ENDPOINT: string
  AD_REVIEW_WORKFLOW: Workflow<AdReviewEvent>
}

export type CF = [env: Env, context: ExecutionContext]

export interface IAppAuthenticatedRequest extends IRequest {
  userId: number
}
