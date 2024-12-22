export interface IFipeClient {}

export class FipeClient implements IFipeClient {
  private _baseURL = 'https://veiculos.fipe.org.br'

  constructor() {
    const AsyncFunction = async function () {}.constructor
    const Func = function () {}.constructor
    return new Proxy(this, {
      get(target, prop: keyof FipeClient) {
        const origMethod = target[prop]
        if (origMethod instanceof AsyncFunction) {
          const asyncFn = (...args: []) => AsyncFunction(origMethod, args)
          const fn = (...args: []) => Func(origMethod, args)

          return async function (...args: []) {
            try {
              const result = await origMethod.apply(target, args)
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

  private _buildURL(pathname: string) {
    const url = new URL(this._baseURL)
    url.pathname = `/api/veiculos/${pathname}`
    return url
  }

  emiteErro() {
    throw new Error('sync emiteErro')
  }

  async getTables() {
    const pathname = 'ConsultarTabelaDeReferencia'
    const url = this._buildURL(pathname)

    const response = await fetch(url, {
      method: 'post'
    })
    const text = await response.text()
    if (!response.ok) {
      console.log('deu pau', await response.text())
    }
    else {
      throw new Error('get tables')
      return text
    }
  }
}
