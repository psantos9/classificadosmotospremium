import type { Env, IAppAuthenticatedRequest } from '@/types'
import { CodigoTipoVeiculo, FipeApiClient } from '@/clients/fipe-api-client'
import { FipeClient } from '@/durable-objects/fipe'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { AutoRouter, error, StatusError } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/fipe',
  catch: defaultErrorHandler
})
  .get('/marcas', async (_req, env) => {
    const stub = FipeClient.getStub(env)
    const makes = await stub.getMakes(CodigoTipoVeiculo.MOTO)
    return makes
  })
  .get('/marcas/:codigoMarca/modelos', async (req, env) => {
    const codigoMarca = Number.parseInt(req.params.codigoMarca)
    const stub = FipeClient.getStub(env)
    const models = await stub.getModelsByMake(codigoMarca, CodigoTipoVeiculo.MOTO)
    return models
  })
  .get('/marcas/:codigoMarca/modelos/:codigoModelo/anos', async (req, env) => {
    const codigoMarca = Number.parseInt(req.params.codigoMarca)
    const codigoModelo = Number.parseInt(req.params.codigoModelo)
    const stub = FipeClient.getStub(env)
    const anosModelo = await stub.getModelYears({ codigoMarca, codigoModelo, codigoTipoVeiculo: CodigoTipoVeiculo.MOTO })
    return anosModelo
  })
  .get('/marcas/:codigoMarca/modelos/:codigoModelo/:codigoTipoCombustivel/:anoModelo/preco', async (req, env) => {
    const codigoMarca = Number.parseInt(req.params.codigoMarca)
    const codigoModelo = Number.parseInt(req.params.codigoModelo)
    const anoModelo = Number.parseInt(req.params.anoModelo)
    const codigoTipoCombustivel = Number.parseInt(req.params.codigoTipoCombustivel)
    const stub = FipeClient.getStub(env)
    const price = await stub.getPriceForModel({ codigoMarca, codigoModelo, codigoTipoCombustivel, codigoTipoVeiculo: CodigoTipoVeiculo.MOTO, anoModelo })
    if (price === null) {
      return error(404, 'Preço não encontrado')
    }
    return price
  })
