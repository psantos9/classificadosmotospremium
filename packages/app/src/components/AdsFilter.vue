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
        :class-input="{ 'outline-[var(--primary)] outline-2': !!estado }"
      />
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <span class="text-sm font-bold ">Marca</span>
      <Combobox
        v-model="marca"
        :data="marcas"
        :loading="loadingMarcas"
        :nullable="true"
        :class-input="{ 'outline-[var(--primary)] outline-2': !!marca }"
      />
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Ano</span>
      <input
        v-model="anoMinimo"
        v-maska="{ mask: '####' }"
        class="form-input" placeholder="de"
        :class="{ 'outline-[var(--primary)] outline-2': anoMinimo }"
      >
      <input
        v-model="anoMaximo"
        v-maska="{ mask: '####' }"
        class="form-input"
        placeholder="até"
        :class="{ 'outline-[var(--primary)] outline-2': anoMaximo }"
      >
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Preço</span>
      <div class="relative">
        <span class="absolute top-1/2 -translate-y-1/2 left-2 text-sm">R$ </span>
        <input
          v-model="precoMinimo"
          v-maska="{ reversed: true }"
          class="form-input pl-7"
          placeholder=" de"
          data-maska-tokens="9:[0-9]:repeated"
          data-maska="9.99#"
          :class="{ 'outline-[var(--primary)] outline-2': precoMinimo }"
        >
      </div>
      <div class="relative">
        <span class="absolute top-1/2 -translate-y-1/2 left-2 text-sm">R$ </span>
        <input
          v-model="precoMaximo"
          v-maska="{ reversed: true }"
          class="form-input pl-7"
          placeholder=" até"
          data-maska-tokens="9:[0-9]:repeated"
          data-maska="9.99#"
          :class="{ 'outline-[var(--primary)] outline-2': precoMaximo }"
        >
      </div>
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 gap-2">
      <span class="text-sm font-bold col-span-2">Quilometragem (km)</span>
      <input
        v-model="quilometragemMinima"
        v-maska="{ reversed: true }"
        class="form-input"
        placeholder="de"
        data-maska-tokens="9:[0-9]:repeated"
        data-maska="9.99#"
        :class="{ 'outline-[var(--primary)] outline-2': quilometragemMinima }"
      >
      <input
        v-model="quilometragemMaxima"
        v-maska="{ reversed: true }"
        class="form-input"
        placeholder="até"
        data-maska-tokens="9:[0-9]:repeated"
        data-maska="9.99#"
        :class="{ 'outline-[var(--primary)] outline-2': quilometragemMaxima }"
      >
    </div>
    <div class="p-4 md:p-2 grid grid-cols-2 items-center gap-4">
      <span class="text-sm font-bold col-span-2">Anunciante</span>

      <div class="flex items-center">
        <input
          v-model="pj"
          checked
          type="checkbox"
          class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none ring-0"
        >
        <label class="ms-2 text-sm">Loja</label>
      </div>
      <div class="flex items-center">
        <input
          v-model="pf"
          checked
          type="checkbox" value="" class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none focus:ring-0"
        >
        <label class="ms-2 text-sm font-medium">Particular</label>
      </div>
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-4 md:gap-2">
      <button
        class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-all disabled:opacity-50 disabled:pointer-events-none"
        :disabled="!meta.dirty || !meta.valid"
        @click="commitFilter"
      >
        Aplicar Filtros
      </button>
      <button
        class="border border-[var(--secondary)] text-[var(--secondary)] hover:bg-gray-100 font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-all disabled:opacity-50 disabled:pointer-events-none"
        :disabled="!meta.dirty || !meta.valid"
        @click="resetFilter()"
      >
        Limpar Filtros
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Combobox from '@/components/Combobox.vue'
import { useApp } from '@/composables/useApp'
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { ref, toRefs } from 'vue'
import { z } from 'zod'

const props = defineProps<{ close?: () => void }>()

const filterSchema = z.object({
  estado: z.string().optional().nullable().default(null),
  marca: z.string().optional().nullable().default(null),
  anoMinimo: z.coerce.number().int().optional(),
  anoMaximo: z.coerce.number().int().optional(),
  precoMinimo: z.preprocess((val) => {
    if (typeof val !== 'string') {
      return false
    }
    const numberPattern = /\d+/g
    const number = Number.parseInt(val.match(numberPattern)?.join('') ?? '')
    return number
  }, z.number()).optional(),
  precoMaximo: z.preprocess((val) => {
    if (typeof val !== 'string') {
      return false
    }
    const numberPattern = /\d+/g
    const number = Number.parseInt(val.match(numberPattern)?.join('') ?? '')
    return number
  }, z.number()).optional(),
  quilometragemMinima: z.preprocess((val) => {
    if (typeof val !== 'string') {
      return false
    }
    const numberPattern = /\d+/g
    const number = Number.parseInt(val.match(numberPattern)?.join('') ?? '')
    return number
  }, z.number()).optional(),
  quilometragemMaxima: z.preprocess((val) => {
    if (typeof val !== 'string') {
      return false
    }
    const numberPattern = /\d+/g
    const number = Number.parseInt(val.match(numberPattern)?.join('') ?? '')
    return number
  }, z.number()).optional(),
  pf: z.boolean().optional().default(true),
  pj: z.boolean().optional().default(true)
})

const validationSchema = toTypedSchema(filterSchema)

const { defineField, validate, values, meta, resetForm } = useForm({ validationSchema })

const [estado] = defineField('estado')
const [marca] = defineField('marca')
const [anoMinimo] = defineField('anoMinimo')
const [anoMaximo] = defineField('anoMaximo')
const [precoMinimo] = defineField('precoMinimo')
const [precoMaximo] = defineField('precoMaximo')
const [quilometragemMinima] = defineField('quilometragemMinima')
const [quilometragemMaxima] = defineField('quilometragemMaxima')
const [pj] = defineField('pj')
const [pf] = defineField('pf')

const { api } = useApp()
const loadingMarcas = ref(false)
const loadingEstados = ref(false)

const estados = ref<string[]>([])

const marcas = ref<string[]>([])

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
    marcas.value = await api.fetchMarcasAnuncios()
  }
  catch (err) {
    marcas.value = []
    throw err
  }
  finally {
    loadingMarcas.value = false
  }
}

const commitFilter = async () => {
  await validate()
  const filter = filterSchema.parse(values)
  console.log('FILTER', filter)
  props?.close?.()
}

const resetFilter = async () => {
  await resetForm()
  props?.close?.()
}

atualizaMarcas()
atualizaEstados()
</script>
