<template>
  <div class="bg-white flex flex-col divide-y rounded-md relative" tabindex="1">
    <button v-if="typeof close === 'function'" class="absolute top-0 right-0 m-2 p-2" @click.stop="close?.()">
      <FontAwesomeIcon :icon="faTimes" size="xl" />
    </button>
    <div class="pt-8 flex flex-col items-center p-4 md:p-2 gap-1">
      <FontAwesomeIcon :icon="faFilter" size="2xl" class="text-[var(--primary)]" />
      <span class="uppercase font-black">Filtrar anúncios</span>
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <span class="text-sm font-bold">Estado</span>
      <Combobox
        v-model="estado"
        :data="estados"
        :loading="loadingEstados"
        :nullable="true"
      />
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <span class="text-sm font-bold ">Marca</span>
      <Combobox
        v-model="marca"
        :data="marcas"
        label-key="marca"
        :loading="loadingMarcas"
        :nullable="true"
      />
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Ano</span>
      <input class="form-input" placeholder="de">
      <input class="form-input" placeholder="até">
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Preço</span>
      <input class="form-input" placeholder="de">
      <input class="form-input" placeholder="até">
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Quilometragem</span>
      <input class="form-input" placeholder="de">
      <input class="form-input" placeholder="até">
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 items-center gap-4">
      <span class="text-sm font-bold col-span-2">Anunciante</span>

      <div class="flex items-center">
        <input checked type="checkbox" value="" class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none ring-0">
        <label class="ms-2 text-sm">Loja</label>
      </div>
      <div class="flex items-center">
        <input checked type="checkbox" value="" class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none focus:ring-0">
        <label class="ms-2 text-sm font-medium">Particular</label>
      </div>
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-4 md:gap-2">
      <button
        class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-colors"
      >
        Aplicar Filtros
      </button>
      <button
        class="border border-[var(--secondary)] text-[var(--secondary)] hover:bg-gray-100 font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Marca } from '@cmp/api/clients/fipe-api-client'
import Combobox from '@/components/Combobox.vue'
import { useApp } from '@/composables/useApp'
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

defineProps<{ close?: () => void }>()

const { api } = useApp()
const loadingMarcas = ref(false)
const loadingEstados = ref(false)

const estados = ref<string[]>([])
const estado = ref<string | null>(null)

const marcas = ref<Marca[]>([])
const marca = ref<Marca | null>(null)

const atualizaEstados = async () => {
  try {
    loadingEstados.value = true
    estados.value = await api.fetchEstadosAnuncios()
  }
  catch (err) {
    marcas.value = []
    throw err
  }
  finally {
    loadingEstados.value = false
  }
}

const atualizaMarcas = async () => {
  try {
    loadingMarcas.value = true
    marcas.value = await api.fetchMarcas()
  }
  catch (err) {
    marcas.value = []
    throw err
  }
  finally {
    loadingMarcas.value = false
  }
}

atualizaMarcas()
atualizaEstados()
</script>
