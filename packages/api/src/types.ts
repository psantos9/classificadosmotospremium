import type { IRequest } from 'itty-router'

export interface Env {
  DB: D1Database
  CEP: KVNamespace
  API_SECRET: string
}

export type CF = [env: Env, context: ExecutionContext]

export interface IAppAuthenticatedRequest extends IRequest {
  userId: string
}
