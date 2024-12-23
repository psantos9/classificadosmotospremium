const AsyncFunction = async function () {}.constructor
export abstract class ErrorHandler {
  constructor() {
    // eslint-disable-next-line ts/no-this-alias
    const ctx = this
    return new Proxy(this, {
      get(target, prop: keyof ErrorHandler) {
        const origMethod = target[prop] as any
        if (prop === 'defaultErrorHandler' || typeof origMethod !== 'function') {
          return origMethod
        }
        const fn = origMethod instanceof AsyncFunction
          ? async (...args: []) => {
            try {
              const result = await (origMethod as typeof AsyncFunction).apply(target, args)
              return result
            }
            catch (err) {
              await ctx.defaultErrorHandler(err, origMethod as typeof AsyncFunction)
            }
          }
          : (...args: []) => {
              try {
                const result = origMethod.apply(target, args)
                return result
              }
              catch (err) {
                ctx.defaultErrorHandler(err, origMethod)
              }
            }
        return fn
      }
    })
  }

  abstract defaultErrorHandler(err: unknown, fn: typeof Function | typeof AsyncFunction): void | Promise<void>
}
