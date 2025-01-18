import type { Usuario } from '@cmp/shared/models/database/models'
import type { IRequest } from 'itty-router'
import type { FipeClient } from './durable-objects/fipe'
import type { UserDO } from './durable-objects/UserDO'
import type { UsersDO } from './durable-objects/UsersDO'
import type { AdReviewEvent } from './workflows/AdReviewWorkflow'
import type { DeleteAdEvent } from './workflows/DeleteAdWorkflow'
import type { ProcessAdMessageEvent } from './workflows/ProcessAdMessageWorkflow'

export interface Env {
  DB: D1Database
  CEP: KVNamespace
  SOCKET_AUTH: KVNamespace
  FIPE_DO: DurableObjectNamespace<FipeClient>
  USER_DO: DurableObjectNamespace<UserDO>
  USERS_DO: DurableObjectNamespace<UsersDO>
  ENVIRONMENT: string
  API_SECRET: string
  IMAGEKIT_PRIVATE_KEY: string
  TYPESENSE_API_KEY: string
  TYPESENSE_URL_ENDPOINT: string
  IMAGEKIT_URL_ENDPOINT: string
  OPENCAGE_API_KEY: string
  TURNSTILE_SECRET_KEY: string
  AD_REVIEW_WORKFLOW: Workflow<AdReviewEvent>
  DELETE_AD_WORKFLOW: Workflow<DeleteAdEvent>
  PROCESS_AD_MESSAGE_WORKFLOW: Workflow<ProcessAdMessageEvent>
}

export type CF = [env: Env, context: ExecutionContext]

export interface IAppAuthenticatedRequest extends IRequest {
  user: Usuario
}
