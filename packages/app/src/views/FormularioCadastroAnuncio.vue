<template>
  <div
    class="view-container"
  >
    <div class="card">
      <div class="card-header">
        Cadastro do Anúncio
      </div>
      <div class="card-section">
        <span class="title">Dados do Veículo</span>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-6">
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Marca"
            :data="marcas"
            label-key="marca"
            :loading="loadingMarcas"
          />
          <Combobox
            v-model="modelo"
            class="sm:col-span-3"
            label="Modelo"
            :data="modelos"
            label-key="modelo"
            :loading="loadingMarcas"
          />
          <Combobox
            v-model="anoModelo"
            class="sm:col-span-3"
            label="Ano Modelo"
            :data="anosModelo"
            :loading="loadingMarcas"
          />
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Ano Fabricação</label>
            <div class="mt-2 relative">
              <input
                v-model="ano"
                v-bind="anoAttrs"
                type="number"
                class="form-input"
              >
              <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                {{ errors.ano }}
              </p>
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Quilometragem (km)</label>
            <div class="mt-2 relative">
              <input
                v-model="quilometragem"
                v-bind="quilometragemAttrs"
                class="form-input"
                type="number"
              >
              <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                {{ errors.quilometragem }}
              </p>
            </div>
          </div>
          <Combobox
            v-model="cor"
            class="sm:col-span-3"
            label="Cor"
            :data="cores"
            :loading="loadingCores"
          />
        </div>
      </div>
      <div class="card-section">
        <span class="title">Preço</span>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Valor FIPE</label>
            <div class="mt-2 relative">
              <div class="form-input bg-gray-100 relative">
                <span>{{ precoFIPE ?? 'R$' }}</span>
                <span v-if="loadingPreco" class="absolute top-1/2 -translate-y-1/2 right-3">
                  <FontAwesomeIcon :icon="faSpinner" :spin="true" />
                </span>
              </div>
            </div>
          </div>
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Preço Anúncio</label>
            <div class="mt-2 relative">
              <span class="absolute top-1/2 -translate-y-1/2 ml-2 text-sm">R$ </span>
              <input
                v-model="preco"
                v-maska="{
                  reversed: true,
                }"
                data-maska-tokens="9:[0-9]:repeated"
                data-maska="9.99#"
                autocomplete="off"
                class="form-input pl-8"
              >
            </div>
          </div>
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Aceita proposta de troca?</label>
            <label class="mt-2 inline-flex items-center cursor-pointer">
              <input v-model="aceitaTroca" type="checkbox" class="sr-only peer">
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]" />
              <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{{ aceitaTroca ? 'Sim' : 'Não' }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Acessórios</span>
        <span class="text-xs text-gray-500 mb-2">Selecione os itens de série e opcionais do seu veículo para atrair a atenção dos compradores.</span>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item, i) in listaAcessorios" :key="i"
            class="select-none text-sm bg-white border border-gray-300 hover:border-[var(--primary-lighter)]  rounded-md px-2 py-1 cursor-pointer transition-colors data-[selected=true]:bg-[var(--primary-lighter)] data-[selected=true]:border-[var(--primary-lighter)]"
            :data-selected="acessorios.includes(item)"
            @click="toggleItem(item, acessorios)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Informações Adicionais</span>
        <span class="text-xs text-gray-500 mb-2">Selecione os itens que representam detalhes do seu veículo para atrair a atenção dos compradores.</span>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item, i) in listaInformacoesAdicionais" :key="i"
            class="select-none text-sm bg-white border border-gray-300 hover:border-[var(--primary-lighter)] rounded-md px-2 py-1 cursor-pointer transition-colors data-[selected=true]:bg-[var(--primary-lighter)] data-[selected=true]:border-[var(--primary-lighter)]"
            :data-selected="informacoesAdicionais.includes(item)"
            @click="toggleItem(item, informacoesAdicionais)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Descrição</span>
        <span class="text-xs text-gray-500">Selecione os itens que representam detalhes do seu veículo para atrair a atenção dos compradores.</span>
        <textarea
          id="descricao"
          v-model="descricao"
          v-bind="descricaoAttrs"
          rows="4"
          class="block w-full rounded-md bg-white px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
        />
      </div>
      <div class="card-section">
        <span class="title">Placa</span>
        <span class="text-xs text-gray-500 mb-2">A placa é obrigatória, mas fique tranquilo, pois não será exibida no seu anúncio. Utilizamos a placa do veículo apenas para verificações de segurança.</span>
        <div class="relative md:max-w-xs">
          <input
            v-model="placa"
            v-bind="placaAttrs"
            v-maska="{ mask: '*** ****', preProcess: val => val.toUpperCase() }"
            autocomplete="off"
            class="form-input"
          >
          <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
            {{ errors.placa }}
          </p>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Localização da moto</span>
        <div class="flex">
          <div>
            <label for="cep" class="block text-sm/6 font-medium">CEP</label>
            <div class="mt-2 flex gap-4 items-center">
              <div class="relative">
                <input
                  id="cep"
                  v-model="cep"
                  v-bind="cepAttrs"
                  v-maska="{ mask: '#####-###' }"
                  class="form-input"
                >
                <div class="absolute top-1/2 -translate-y-1/2 right-2">
                  <FontAwesomeIcon v-if="errors.cep" :icon="faExclamationTriangle" fixed-width size="lg" class="text-[var(--danger)]" />
                  <FontAwesomeIcon v-if="loadingCepRequests > 0" :icon="faSpinner" fixed-width size="lg" class="text-gray-100" />
                  <FontAwesomeIcon v-if="localidade && !errors.cep" :icon="faCheckCircle" fixed-width size="lg" class="text-[var(--success)]" />
                </div>

                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.cep }}
                </p>
              </div>
              <div v-if="cep && localidade && !loadingCepRequests" class="shrink-0 font-semibold flex items-center gap-1 text-gray-500">
                <FontAwesomeIcon :icon="faLocationDot" size="xl" fixed-width :spin="loadingCepRequests > 0" />
                <span>
                  {{ localidade }} / {{ uf }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Telefone para contato (opcional)</span>
        <span class="text-xs text-gray-500">Adicione um número de celular caso deseje que seja publicado juntamento com o anúncio em nossas plataformas.</span>
        <div class="mt-2 relative md:max-w-[150px]">
          <input
            v-model="celular"
            v-maska="{ mask: '(##) #####-####' }"
            v-bind="celularAttrs"
            class="form-input"
          >
          <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
            {{ errors.celular }}
          </p>
        </div>
      </div>
      <div v-if="anuncio !== null" class="card-section">
        <div class="flex items-center justify-between">
          <span class="title">
            Fotos
          </span>
          <button
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center gap-2"
            @click="(uppy.getPlugin('Dashboard') as any)?.openModal?.()"
          >
            Adicionar Fotos
            <FontAwesomeIcon :icon="faPlus" />
          </button>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4 items-start justify-center">
          <div
            v-for="(foto, i) in fotos.filter(foto => !photosToDelete.includes(foto))"
            :key="foto"
            v-draggable="{ group: 'fotos', data: foto, dropCallback: (group: string, droppedFoto: string) => swapFotos(foto, droppedFoto) }"
            data-dragging-active="fotos"
            :data-index="i"
            class="aspect-square bg-black group rounded-md overflow-hidden md:data-[index=0]:col-span-2 md:data-[index=0]:row-span-2 h-full flex items-center justify-center relative cursor-pointer data-[dragover]:scale-105 transition-all"
          >
            <img :src="api.getImageUrl({ imageId: foto, thumbnail: i !== 0 })" class="object-cover h-full">
            <div class="absolute top-0 left-0 bg-white/90 text-xs rounded-md shadow px-2 py-1 m-1 font-light">
              {{ i === 0 ? 'Foto principal' : i + 1 }}
            </div>
            <button
              v-if="i > 0"
              class="opacity-0 group-hover:opacity-100 absolute top-0 right-0 rounded-full py-1 m-1 w-7 h-7 flex items-center justify-center bg-[var(--danger)] hover:bg-[var(--danger-lighter)] text-[var(--danger-text)] border border-[var(--danger)] cursor-pointer transition-all"
              @click="photosToDelete.push(foto); removeFotos()"
            >
              <FontAwesomeIcon :icon="faTrash" size="sm" fixed-width />
            </button>
            <button
              v-if="i !== 0"
              class="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 rounded-full py-1 m-1 w-7 h-7 flex items-center justify-center bg-white hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] border hover:border-[var(--primary)] cursor-pointer transition-all"
              @click="moveFotoLeft(foto)"
            >
              <FontAwesomeIcon :icon="faArrowLeft" size="sm" fixed-width />
            </button>
            <button
              v-if="i !== anuncio.fotos.length - 1"
              class="opacity-0 group-hover:opacity-100 absolute bottom-0 right-0 rounded-full py-1 m-1 w-7 h-7 flex items-center justify-center bg-white hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] border hover:border-[var(--primary)] cursor-pointer transition-all"
              @click="moveFotoRight(foto)"
            >
              <FontAwesomeIcon :icon="faArrowRight" size="sm" fixed-width />
            </button>
          </div>
          <div
            v-for="([photoKey, url]) in Object.entries(photoUploadIndex).filter(([photoKey]) => !anuncio?.fotos.includes(photoKey))" :key="photoKey"
            class="group rounded-md overflow-hidden data-[index=0]:col-span-2 data-[index=0]:row-span-2 h-full flex items-center justify-center relative bg-black cursor-pointer shadow data-[dragover]:scale-105 transition-all"
          >
            <img :src="url" class="aspect-[4/3]">
            <div class="absolute inset text-white w-full h-full flex items-center justify-center bg-black/50 transition-colors">
              <FontAwesomeIcon :icon="faSpinner" size="lg" spin />
            </div>
          </div>
        </div>

        <div class="mt-4 md:mt-14 flex flex-col items-center md:flex-row gap-4 justify-between">
          <button
            v-if="adId !== null && anuncio.status !== 'archived'"
            type="button"
            class="text-white bg-[var(--danger)] hover:bg-[var(--danger-lighter)] focus:outline-none font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center gap-2 me-2"
            @click="removeAnuncio"
          >
            <FontAwesomeIcon :icon="faTrash" />
            Arquivar
          </button>
          <button
            v-if="anuncio.atualizacao !== null"
            type="button"
            class="text-white bg-[var(--secondary)] hover:bg-[var(--secondary-lighter)] focus:outline-none font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center gap-2 me-2"
            @click="resetAdChanges"
          >
            <FontAwesomeIcon :icon="faRotateLeft" />
            Remover alteracoes
          </button>
          <div class="flex-1" />
          <button
            v-if="anuncio.atualizacao"
            type="button"
            class="text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] focus:outline-none font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center gap-2 me-2"
            @click="submitForReview"
          >
            <FontAwesomeIcon :icon="submitting ? faSpinner : faArrowRight" size="lg" :spin="submitting" fixed-width />
            Publicar
          </button>
        </div>
      </div>
      <div v-if="meta.touched && Object.keys(errors).length > 0" class="flex flex-col items-center px-8 py-4 text-sm">
        <div class="flex gap-2 items-center text-[var(--warning)] uppercase mb-4">
          <FontAwesomeIcon :icon="faExclamationTriangle" size="2x" />
          <span class="text-xl font-bold text-[var(--warning)]">Os seguintes campos têm pendências</span>
        </div>

        <span v-for="[key, value] of Object.entries(errors)" :key="key">
          <span class="font-bold capitalize">{{ key }}:</span> {{ value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Marca, Modelo } from '@cmp/api/clients/fipe-api-client'
import type { Anuncio } from '@cmp/shared/models/database/models'
import Combobox from '@/components/Combobox.vue'
import { useApp } from '@/composables/useApp'
import { type AtualizaAnuncio, getAtualizaAnuncioSchema } from '@cmp/shared/models/atualiza-anuncio'
import { faArrowLeft, faArrowRight, faCheckCircle, faExclamationTriangle, faLocationDot, faPlus, faRotateLeft, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import ImageEditor from '@uppy/image-editor'
import ptBR from '@uppy/locales/lib/pt_BR'
import XHR from '@uppy/xhr-upload'
import { toTypedSchema } from '@vee-validate/zod'
import debounce from 'lodash.debounce'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { ZodError } from 'zod'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/image-editor/dist/style.min.css'

const router = useRouter()
const route = useRoute()
const { api } = useApp()
const toast = useToast()

const adId = ref<number | null>(null)
const anuncio = ref<Anuncio | null>(null)

const cores = ref<string[]>([])
const listaAcessorios = ref<string[]>([])
const listaInformacoesAdicionais = ref<string[]>([])
const loadingCepRequests = ref(0)

const uppy = new Uppy({ locale: ptBR, allowMultipleUploadBatches: false })
  .use(Dashboard, { closeAfterFinish: true, closeModalOnClickOutside: true })
  .use(ImageEditor, {
    actions: {
      cropSquare: false,
      cropWidescreen: false,
      cropWidescreenVertical: false,
      rotate: false
    },
    cropperOptions: { initialAspectRatio: 4 / 3, aspectRatio: 4 / 3 }
  })
  .use(XHR, {
    endpoint: '',
    responseType: 'json',
    bundle: true,
    formData: true,
    onBeforeRequest: (xhr) => {
      xhr.open('POST', api.getAdImageUploadURL(unref(adId) ?? -1))
      xhr.setRequestHeader('Authorization', `Bearer ${api.bearerToken}`)
    },
    getResponseData(xhr) {
      const data = xhr.response as Anuncio
      return data
    },
    onAfterResponse: (xhr) => {
      if (xhr.status === 200) {
        anuncio.value = xhr.response as Anuncio
      }
    }
  })

uppy.on('dashboard:modal-closed', () => {
  uppy.cancelAll()
})

const anuncioFormSchema = toTypedSchema(getAtualizaAnuncioSchema())

const { errors, defineField, values, setFieldValue, setFieldError, meta, resetForm, validate } = useForm({
  validationSchema: anuncioFormSchema,
  initialValues: { fotos: [], informacoesAdicionais: [], acessorios: [], descricao: '', aceitaTroca: false }
})

const [cor] = defineField('cor', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [aceitaTroca] = defineField('aceitaTroca', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [cep, cepAttrs] = defineField('cep', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [localidade] = defineField('localidade', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [uf] = defineField('uf', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [celular, celularAttrs] = defineField('celular', { validateOnBlur: true, validateOnChange: false, validateOnInput: false })
const [ano, anoAttrs] = defineField('ano', { validateOnBlur: false, validateOnChange: false, validateOnInput: false })
const [placa, placaAttrs] = defineField('placa', { validateOnBlur: true, validateOnChange: false, validateOnInput: false })
const [quilometragem, quilometragemAttrs] = defineField('quilometragem')
const [descricao, descricaoAttrs] = defineField('descricao')

const requests = ref(0)
const submitting = computed(() => unref(requests) > 0)

const loadingMarcas = ref(false)
const loadingModelos = ref(false)
const loadingAnosModelo = ref(false)
const loadingPreco = ref(false)
const loadingCores = ref(false)

const marca = ref<Marca | null>(null)
const modelo = ref<Modelo | null>(null)

const marcas = ref<Marca[]>([])
const modelos = ref<Modelo[]>([])

const anoModelo = ref<number | null>(null)

const anosModelo = ref<number[]>([])

const precoFIPE = ref<string | null>(null)
const preco = ref<string | null>(null)

const acessorios = ref<string[]>([])
const informacoesAdicionais = ref<string[]>([])

const fotos = ref<string[]>([])
const photoUploadIndex = ref<Record<string, string>>({})
const photosToDelete = ref<string[]>([])

const atualizaMarcas = async () => {
  try {
    loadingMarcas.value = true
    marcas.value = await api.fetchMarcas()
  }
  catch (err) {
    marca.value = null
    marcas.value = []
    modelo.value = null
    modelos.value = []
    throw err
  }
  finally {
    loadingMarcas.value = false
  }
}

const atualizaModelos = async () => {
  const codigoMarca = unref(marca)?.codigoMarca ?? null
  modelo.value = null
  if (codigoMarca === null) {
    modelos.value = []
    modelo.value = null
    return
  }
  try {
    loadingModelos.value = true
    modelos.value = await api.fetchModelos(codigoMarca)
  }
  catch (err) {
    modelos.value = []
    modelo.value = null
    throw err
  }
  finally {
    loadingModelos.value = false
  }
}

const atualizaAnosModelo = async () => {
  const codigoMarca = unref(marca)?.codigoMarca ?? null
  const codigoModelo = unref(modelo)?.codigoModelo ?? null

  if (codigoMarca === null || codigoModelo === null) {
    anoModelo.value = null
    setFieldValue('ano', undefined)
    anosModelo.value = []
    return
  }
  try {
    loadingAnosModelo.value = true
    anosModelo.value = await api.fetchAnosModelos({ codigoMarca, codigoModelo })
      .then(anosModelo => anosModelo.reduce((accumulator, anoModelo) => {
        if (anoModelo.codigoTipoCombustivel === 1) {
          accumulator.push(anoModelo.anoModelo)
        }
        return accumulator
      }, [] as number[]))
      .then(anosModelo => anosModelo.sort((A, B) => A > B ? -1 : A < B ? 1 : 0))
    const _anoModelo = unref(anoModelo)
    if (_anoModelo === null || !unref(anosModelo).includes(_anoModelo)) {
      anoModelo.value = unref(anosModelo)[0] ?? null
    }
  }
  catch (err) {
    anoModelo.value = null
    anosModelo.value = []
    throw err
  }
  finally {
    loadingAnosModelo.value = false
  }
}

const atualizaPreco = async () => {
  const codigoMarca = unref(marca)?.codigoMarca ?? null
  const codigoModelo = unref(modelo)?.codigoModelo ?? null
  const _anoModelo = unref(anoModelo) ?? null
  if (codigoMarca === null || codigoModelo === null || _anoModelo === null) {
    precoFIPE.value = null
    preco.value = null
    setFieldValue('codigoFipe', undefined)
    return
  }
  try {
    loadingPreco.value = true
    const _preco = await api.fetchPreco({ codigoMarca, codigoModelo, anoModelo: _anoModelo })
    setFieldValue('codigoFipe', _preco.codigoFipe)
    setFieldValue('marca', _preco.marca)
    setFieldValue('modelo', _preco.modelo)
    precoFIPE.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(_preco.precoBRL)
    if (unref(preco) === null) {
      nextTick(() => {
        preco.value = _preco.precoBRL.toString()
      })
    }
  }
  finally {
    loadingPreco.value = false
  }
}

const toggleItem = (item: string, items: string[]) => {
  const idx = items.findIndex(_item => _item === item)
  if (idx > -1) {
    items.splice(0, items.length, ...items.filter(_item => _item !== item))
  }
  else {
    items.push(item)
  }
  items.sort()
}

const setAdState = async (ad: Anuncio | null) => {
  if (unref(marcas).length === 0) {
    await atualizaMarcas()
  }
  marca.value = ad === null ? null : unref(marcas).find(marca => marca.marca === ad.marca) ?? null
  await atualizaModelos()
  modelo.value = ad === null ? null : unref(modelos).find(modelo => modelo.modelo === ad.modelo) ?? null
  anoModelo.value = ad?.anoModelo ?? null
  ano.value = ad?.ano ?? undefined
  quilometragem.value = ad?.quilometragem ?? undefined

  setFieldValue('cep', ad?.cep)
  setFieldValue('localidade', ad?.localidade)
  setFieldError('uf', ad?.uf)

  nextTick(() => {
    preco.value = ad?.preco.toString() ?? null
  })

  setFieldValue('cor', ad?.cor)
  setFieldValue('aceitaTroca', ad?.aceitaTroca ?? false)
  setFieldValue('celular', ad?.celular ?? '')
  placa.value = ad?.placa ?? undefined
  acessorios.value = [...ad?.acessorios ?? []]
  informacoesAdicionais.value = [...ad?.informacoesAdicionais ?? []]
  descricao.value = ad?.descricao ?? undefined
  anuncio.value = ad
  fotos.value = [...ad?.fotos ?? []]
  if (ad === null) {
    resetForm()
  }
  else {
    validate()
  }
}

const removeAnuncio = async () => {
  const _adId = unref(adId)
  if (_adId !== null) {
    api.removeAnuncio(_adId)
    await router.back()
  }
}

const resetAdChanges = async () => {
  const _adId = unref(adId)
  if (_adId === null) {
    return
  }
  anuncio.value = await api.cancelaAlteracoesAnuncio(_adId)
}

const submitForReview = async () => {
  const _adId = unref(adId)
  if (_adId === null) {
    return
  }
  try {
    requests.value++

    await api.submeteAnuncioParaRevisao(_adId)
    toast.info('O seu anúncio será revisto e publicado em breve.')
    requests.value--
    await router.push({ name: 'meus-anuncios' })
  }
  catch (err) {
    toast.error('Ocorreu um erro ao publicar o anúncio.')
    console.log(err)
    requests.value--
  }
}

const removeFotos = debounce(async () => {
  const _ad = unref(anuncio)
  if (_ad === null) {
    return
  }
  const { id: adId } = _ad
  const imageKeys = [...unref(photosToDelete)]
  const ad = await api.removeImagens({ adId, imageKeys })
  setAdState(ad)
}, 500)

const atualizaAnuncio = async (atualizacao: AtualizaAnuncio) => {
  const _anuncio = unref(anuncio)
  const hasDifferences = [...Object.entries(atualizacao)]
    .reduce((accumulator, [key, value], _, array) => {
      if (key === 'location') {
        return accumulator
      }
      const A = JSON.stringify(_anuncio?.[key as keyof Anuncio] ?? null)
      const B = JSON.stringify(value)
      if (A !== B) {
        array.splice(0, array.length)
        accumulator = true
      }
      return accumulator
    }, false)
  if (!hasDifferences) {
    return
  }
  const _adId = unref(adId)
  try {
    requests.value++

    if (_adId === null) {
      anuncio.value = await api.criaAnuncio({ anuncio: atualizacao })
      adId.value = unref(anuncio)?.id ?? null
    }
    else {
      anuncio.value = await api.atualizaAnuncio({ adId: _adId, anuncio: atualizacao })
    }
  }
  finally {
    requests.value--
  }
}

const debouncedAtualizaAnuncio = debounce(atualizaAnuncio, 1000)

const moveFotoLeft = async (foto: string) => {
  const _fotos = unref(fotos)
  const index = _fotos.indexOf(foto)
  if (index > 0) {
    [_fotos[index], _fotos[index - 1]] = [_fotos[index - 1], _fotos[index]]
    const atualizacao = getAtualizaAnuncioSchema().parse(unref(values))
    await atualizaAnuncio(atualizacao)
  }
}

const moveFotoRight = async (foto: string) => {
  const _fotos = unref(fotos)
  const index = _fotos.indexOf(foto)
  if (index < _fotos.length - 1) {
    [_fotos[index], _fotos[index + 1]] = [_fotos[index + 1], _fotos[index]]
    const atualizacao = getAtualizaAnuncioSchema().parse(unref(values))
    await atualizaAnuncio(atualizacao)
  }
}

const swapFotos = async (foto1: string, foto2: string) => {
  const _fotos = unref(fotos)
  const index1 = _fotos.indexOf(foto1)
  const index2 = _fotos.indexOf(foto2)
  if (index1 === index2) {
    return
  }
  [_fotos[index1], _fotos[index2]] = [_fotos[index2], _fotos[index1]]
  const atualizacao = getAtualizaAnuncioSchema().parse(unref(values))
  await atualizaAnuncio(atualizacao)
}

const debouncedValidateCEP = debounce(async (cep: string) => {
  const cepOk = unref(errors).cep === undefined
  if (!cepOk) {
    return
  }

  setFieldValue('localidade', '')
  setFieldValue('uf', '')

  try {
    loadingCepRequests.value++
    const openCEP = await api.validateCEP(cep)
    if (openCEP !== null) {
      setFieldValue('localidade', openCEP.localidade)
      setFieldValue('uf', openCEP.uf)
    }
    else {
      setFieldError('cep', 'CEP inválido')
    }
  }
  finally {
    loadingCepRequests.value--
  }
}, 500)

watch(marca, () => atualizaModelos())
watch(modelo, () => atualizaAnosModelo())

watch(acessorios, (acessorios) => {
  setFieldValue('acessorios', acessorios)
}, { deep: true })

watch(informacoesAdicionais, (informacoesAdicionais) => {
  setFieldValue('informacoesAdicionais', informacoesAdicionais)
}, { deep: true })

watch(fotos, (fotos) => {
  setFieldValue('fotos', fotos)
}, { deep: true })

watch(anoModelo, (anoModelo) => {
  setFieldValue('anoModelo', anoModelo ?? undefined)
  atualizaPreco()
})

watch([anoModelo, ano, preco], ([anoModelo, ano, precoFormatted]) => {
  const preco = precoFormatted === null ? undefined : Number(precoFormatted.replace(/[.,]+/g, ''))
  setFieldValue('preco', preco)
  setFieldValue('anoModelo', anoModelo ?? undefined)
  setFieldValue('ano', ano ?? undefined)
})

watch(meta, (meta) => {
  if (meta.valid) {
    try {
      const anuncio = getAtualizaAnuncioSchema().parse(unref(values))
      debouncedAtualizaAnuncio(anuncio)
    }
    catch (err) {
      if (!(err instanceof ZodError)) {
        throw err
      }
    }
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (unref(submitting)) {
    // eslint-disable-next-line no-alert
    if (confirm('Algumas informações do anúncio poderão ser perdidas, mesmo assim quer sair?')) {
      next()
    }
    else {
      return next(false)
    }
  }
  else {
    next()
  }
})

const init = async () => {
  const _adId = unref(adId)
  await atualizaMarcas()
  cores.value = await api.fetchCores()
  listaAcessorios.value = await api.fetchAcessorios()
  listaInformacoesAdicionais.value = await api.fetchInformacoesAdicionais()

  if (_adId !== null) {
    const ad = await api.fetchMeuAnuncio(_adId)
    if (ad === null) {
      toast.error(`Não foi possível encontrar o anúncio`)
      router.push({ name: 'anuncie' })
    }
    else {
      await setAdState(ad)
    }
  }
  else {
    await setAdState(null)
  }
}

watch(anuncio, (anuncio) => {
  setAdState(anuncio)
})

watch(cep, async () => {
  await debouncedValidateCEP(unref(cep)?.toString() as string)
})

watch(route, (route) => {
  const _adId = Number.parseInt(route.params.adId as string)
  adId.value = Number.isNaN(_adId) ? null : _adId
  void init()
}, { immediate: true })
</script>
