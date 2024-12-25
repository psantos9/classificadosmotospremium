<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        Cadastro do Anúncio
      </div>
      {{ meta.valid }} {{ values.quilometragem }}
      <br>
      {{ errors }}
      <button @click="validate()">
        Validate
      </button>
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
            <label for="name" class="block text-sm/6 font-medium">Ano</label>
            <div class="mt-2 relative">
              <input
                v-model="ano"
                v-bind="anoAttrs"
                v-maska="{ mask: '####' }"
                type="text"
                autocomplete="off"
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
                v-maska="{ reversed: true }"
                data-maska-tokens="9:[0-9]:repeated"
                data-maska="9.99#"
                type="text"
                autocomplete="off"
                class="form-input"
              >
            </div>
          </div>
          <Combobox
            v-model="cor"
            class="sm:col-span-3"
            label="Cor"
            :data="cores"
            label-key="label"
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
                type="text"
                autocomplete="off"
                class="form-input pl-8"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Acessórios</span>
        <span class="text-xs text-gray-500 mb-2">Selecione os itens de série e opcionais do seu veículo para atrair a atenção dos compradores.</span>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item) in listaAcessorios" :key="item.id"
            class="select-none text-sm bg-white border border-gray-300 hover:border-[var(--primary-lighter)]  rounded-md px-2 py-1 cursor-pointer transition-colors data-[selected=true]:bg-[var(--primary-lighter)] data-[selected=true]:border-[var(--primary-lighter)]"
            :data-selected="acessorios.includes(item.id)"
            @click="toggleItem(item.id, acessorios)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="card-section">
        <span class="title">Informações Adicionais</span>
        <span class="text-xs text-gray-500 mb-2">Selecione os itens que representam detalhes do seu veículo para atrair a atenção dos compradores.</span>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item) in listaInformacoesAdicionais" :key="item.id"
            class="select-none text-sm bg-white border border-gray-300 hover:border-[var(--primary-lighter)] rounded-md px-2 py-1 cursor-pointer transition-colors data-[selected=true]:bg-[var(--primary-lighter)] data-[selected=true]:border-[var(--primary-lighter)]"
            :data-selected="informacoesAdicionais.includes(item.id)"
            @click="toggleItem(item.id, informacoesAdicionais)"
          >
            {{ item.label }}
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
        <span class="title">Fotos</span>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-6">
          <div class="flex flex-col gap-4 col-span-full md:col-span-3">
            <ImageUpload class="md:col-span-3" />
            <div class="rounded-md border min-h-[100px] p-4 bg-white">
              Lista de fotos
            </div>
          </div>

          <div class="border rounded-md col-span-full md:col-span-3 p-4 bg-white">
            Regras
          </div>
        </div>

        <div class="mt-4 md:mt-14 flex flex-col md:flex-row gap-4 justify-between">
          <button
            type="button"
            class="w-full md:w-40 hidden md:flex items-center justify-center gap-x-2 rounded-md text-[var(--secondary)] border border-[var(--secondary)] px-3.5 py-2.5 text-sm font-semibold shadow-sm"
            @click="$router.push({ name: 'minha-conta' })"
          >
            <FontAwesomeIcon :icon="faArrowLeft" size="lg" />
            Voltar
          </button>
          <button
            type="button"
            class="w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm transition-opacity"
            :class="{
              'opacity-40': submitting || !meta.valid,
            }"
            :disabled="submitting || !meta.valid"
            @click="submit"
          >
            Enviar
            <FontAwesomeIcon :icon="submitting ? faSpinner : faArrowRight" size="lg" :spin="submitting" fixed-width />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Marca, Modelo } from '@cmp/api/clients/fipe-api-client'
import type { Acessorio, Cor, InformacaoAdicional } from '@cmp/shared/models/database/schema'
import Combobox from '@/components/Combobox.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { useApp } from '@/composables/useApp'
import { faArrowLeft, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { ref, unref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { z } from 'zod'

const { api } = useApp()
const toast = useToast()

const cores = ref<Cor[]>([])

const listaAcessorios = ref<Acessorio[]>([])
const listaInformacoesAdicionais = ref<InformacaoAdicional[]>([])

const anuncioSchema = z.object({
  codigoFipe: z.string(),
  anoModelo: z.number().int().gt(1900).lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  ano: z.coerce.number().int().gt(1900, 'Maior do que 1900').lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  quilometragem: z.string().transform(value => Number.parseInt(value.replace(/\./g, ''))),
  preco: z.number(),
  cor: z.object({ id: z.number(), label: z.string() }).transform(({ id }) => id),
  descricao: z.string(),
  acessorios: z.array(z.number()),
  informacoesAdicionais: z.array(z.number()),
  fotos: z.array(z.string())
})

const anuncioFormSchema = toTypedSchema(anuncioSchema)

const { errors, defineField, values, setFieldValue, meta, validate } = useForm({
  validationSchema: anuncioFormSchema,
  initialValues: { fotos: [], informacoesAdicionais: [], acessorios: [], descricao: '' }
})

const [ano, anoAttrs] = defineField('ano')
const [cor] = defineField('cor')
const [quilometragem, quilometragemAttrs] = defineField('quilometragem')
const [descricao, descricaoAttrs] = defineField('descricao')

const submitting = ref(false)
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

const acessorios = ref<number[]>([])
const informacoesAdicionais = ref<number[]>([])

const fotos = ref<string[]>([])

const atualizaMarcas = async () => {
  try {
    loadingMarcas.value = true
    marcas.value = await api.fetchMarcas()
    if (unref(marca) === null) {
      marca.value = unref(marcas).find(marca => marca.codigoMarca === 77) ?? unref(marcas)[0] ?? null
    }
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
    const _anoModelo = unref(anoModelo)
    if (_anoModelo === null || !unref(anosModelo).includes(_anoModelo)) {
      anoModelo.value = null
      setFieldValue('ano', undefined)
    }
  }
  catch (err) {
    setFieldValue('ano', undefined)
    anoModelo.value = null
    anosModelo.value = []
    throw err
  }
  finally {
    loadingAnosModelo.value = false
  }
}

const autalizaPreco = async () => {
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
    precoFIPE.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(_preco.precoBRL)
    preco.value = _preco.precoBRL.toString()
  }
  finally {
    loadingPreco.value = false
  }
}

const toggleItem = (id: number, items: number[]) => {
  const idx = items.findIndex(itemId => itemId === id)
  if (idx < 0) {
    items.push(id)
  }
  else {
    items.splice(idx, 1)
  }
  items.sort()
}

const submit = async () => {
  console.log('sugmitin')
  submitting.value = true
  setTimeout(() => {
    toast.info('submitted')
    submitting.value = false
  }, 5000)
}

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
  setFieldValue('ano', anoModelo ?? undefined)
  autalizaPreco()
})

watch([anoModelo, ano, preco], ([anoModelo, ano, precoFormatted]) => {
  const preco = precoFormatted === null ? undefined : Number(precoFormatted.replace(/[.,]+/g, ''))
  setFieldValue('preco', preco)
  setFieldValue('anoModelo', anoModelo ?? undefined)
  setFieldValue('ano', ano ?? undefined)
})

watch(meta, (meta) => {
  if (meta.valid) {
    const anuncio = anuncioSchema.parse(unref(values))
    console.log('ANUNCIO', anuncio)
  }
})

;(async () => {
  cores.value = await api.fetchCores()
  listaAcessorios.value = await api.fetchAcessorios()
  listaInformacoesAdicionais.value = await api.fetchInformacoesAdicionais()
})()

atualizaMarcas()
</script>
