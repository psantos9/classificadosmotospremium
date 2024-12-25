import { type ErrorHandler, StatusError } from 'itty-router'
import { ZodError } from 'zod'

export const defaultErrorHandler: ErrorHandler = (err, req) => {
  if (err instanceof ZodError) {
    throw new StatusError(400, err)
  }
  const errId = crypto.randomUUID()
  console.error(errId, req.method, req.url, err)
  throw new StatusError(500, errId)
}
