<template>
  <div class="view-container">
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
            <label for="name" class="block text-sm/6 font-medium">Ano</label>
            <div class="mt-2 relative">
              <input
                v-model="ano"
                v-maska="{ mask: '####' }"
                type="text"
                autocomplete="off"
                class="form-input"
              >
            </div>
          </div>
        </div>
        <span class="title mt-8">Preço</span>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Valor FIPE</label>
            <div class="mt-2 relative">
              <div class="form-input bg-gray-100">
                {{ precoFIPE ?? '&zwnj;' }}
              </div>
            </div>
          </div>
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Preço Anúncio</label>
            <div class="mt-2 relative">
              <input
                type="text"
                autocomplete="off"
                class="form-input"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Marca, Modelo, Preco } from '@cmp/api/clients/fipe-api-client'
import Combobox from '@/components/Combobox.vue'
import { useApp } from '@/composables/useApp'
import { vMaska } from 'maska/vue'
import { ref, unref, watch } from 'vue'

const { api } = useApp()

const loadingMarcas = ref(false)
const loadingModelos = ref(false)
const loadingAnosModelo = ref(false)
const loadingPreco = ref(false)

const marca = ref<Marca | null>(null)
const modelo = ref<Modelo | null>(null)

const marcas = ref<Marca[]>([])
const modelos = ref<Modelo[]>([])

const ano = ref<number | null>(null)
const anoModelo = ref<number | null>(null)

const anosModelo = ref<number[]>([])

const precoFIPE = ref<string | null>(null)

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
    ano.value = null
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
      ano.value = null
    }
  }
  catch (err) {
    ano.value = null
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
    return
  }
  try {
    loadingPreco.value = true
    precoFIPE.value = await api.fetchPreco({ codigoMarca, codigoModelo, anoModelo: _anoModelo })
      .then(preco => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco.precoBRL))
  }
  finally {
    loadingPreco.value = false
  }
}

watch(marca, () => atualizaModelos())
watch(modelo, () => atualizaAnosModelo())
watch(anoModelo, (anoModelo) => {
  ano.value = anoModelo
  autalizaPreco()
})

atualizaMarcas()
</script>
