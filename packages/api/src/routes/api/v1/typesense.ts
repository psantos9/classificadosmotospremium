import type { Env, IAppAuthenticatedRequest } from '@/types'
import type { Anuncio } from '@cmp/shared/models/database/models'
import { defaultErrorHandler } from '@/helpers/default-error-handler'
import { TypesenseService } from '@/services/typesense-service'
import { AutoRouter } from 'itty-router'

export const router = AutoRouter<IAppAuthenticatedRequest, [Env, ExecutionContext]>({
  base: '/api/v1/typesense',
  catch: defaultErrorHandler
})
  .post('/collections/ads', async (_req, env) => {
    const typesense = new TypesenseService(env)
    const collection = await typesense.createAdsCollection()
    return collection
  })
  .get('/collections', async (_req, env) => {
    const typesense = new TypesenseService(env)
    const collection = await typesense.getCollections()
    return collection
  })
  .get('/ad', async (_req, env) => {
    const typesense = new TypesenseService(env)
    const ad: Anuncio = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      cep: '70675-105',
      localidade: 'Brasilia',
      uf: 'DF',
      location: null,
      cor: 'Preto',
      marca: 'triumph',
      modelo: 'rocket',
      status: 'published',
      codigoFipe: '23',
      ano: 2021,
      anoModelo: 2022,
      quilometragem: 123123,
      placa: '123231',
      preco: 123902,
      descricao: 'bela moto preta, um canhão',
      acessorios: [],
      informacoesAdicionais: [],
      fotos: [],
      expiresAt: null,
      publishedAt: new Date(),
      reviewWorkflowId: null,
      revision: 1,
      atualizacao: null
    }
    const document = await typesense.upsertAd({ ...ad, id: ad.id.toString(), cor: 'Preto', publishedAt: new Date().getTime() })
    return document
  })
