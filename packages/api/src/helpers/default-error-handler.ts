import { type ErrorHandler, StatusError } from 'itty-router'
import { ZodError } from 'zod'

export const defaultErrorHandler: ErrorHandler = (err) => {
  if (err instanceof ZodError) {
    throw new StatusError(400, err)
  }
  throw new StatusError(500, err)
}
