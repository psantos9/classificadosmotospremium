export interface Env {
  DB: D1Database
  CEP: KVNamespace
  API_SECRET: string
}
export interface ContextData extends Record<string, unknown> {
  userId?: string
}
