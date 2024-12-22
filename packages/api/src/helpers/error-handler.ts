export class ErrorHandler {
  constructor() {
    const AsyncFunction = async function () {}.constructor
    // const Func = function () {}.constructor
    // const asyncFn = (...args: []) => AsyncFunction(origMethod, args)
    return new Proxy(this, {
      get(target, prop: keyof ErrorHandler) {
        const origMethod = target[prop] as any
        if (origMethod instanceof AsyncFunction) {
          return async function (...args: []) {
            try {
              const result = await (origMethod as typeof AsyncFunction).apply(target, args)
              return result
            }
            catch (err) {
              console.log(err)
              throw err
            }
          }
        }
        else if (typeof origMethod === 'function') {
          return function (...args: []) {
            try {
              const result = origMethod.apply(target, args)
              return result
            }
            catch (err) {
              console.log(err)
              throw err
            }
          }
        }
      }
    })
  }
}
