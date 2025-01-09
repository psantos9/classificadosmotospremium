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
      <span class="text-sm font-bold col-span-2">Pesquisa</span>
      <div class="relative">
        <FontAwesomeIcon :icon="faSearch" class="absolute top-1/2 -translate-y-1/2 left-2" />
        <input
          v-model="state.q"
          class="form-input pl-8"
          :class="{ 'outline-[var(--primary)] outline-2': state.q }"
        >
        <FontAwesomeIcon
          v-if="state.q" :icon="faTimes"
          class="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
          @click="state.q = ''"
        />
      </div>
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <span class="text-sm font-bold">Estado</span>
      <Combobox
        v-model="uf"
        :data="estadoFacetCounts.map(facet => facet.value)"
        :clearable="true"
        :class-input="{ 'outline-[var(--primary)] outline-2': !!uf }"
      />
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <span class="text-sm font-bold ">Marca</span>
      <Combobox
        v-model="marca"
        :data="marcaFacetCounts.map(facet => facet.value)"
        :clearable="true"
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
      <span class="text-sm font-bold col-span-2">Tipo de Anunciante</span>

      <div class="flex items-center">
        <input
          v-model="pj"
          checked
          type="checkbox"
          class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none ring-0"
        >
        <label class="ms-2 text-sm">Lojas</label>
      </div>
      <div class="flex items-center">
        <input
          v-model="pf"
          checked
          type="checkbox" value="" class="w-6 h-6 text-xl text-[var(--primary)] border-gray-300 rounded focus:outline-none focus:ring-0"
        >
        <label class="ms-2 text-sm">Particulares</label>
      </div>
    </div>
    <div class="p-4 md:p-2 flex flex-col gap-2">
      <button
        class="md:hidden border border-[var(--primary)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-all disabled:opacity-50 disabled:pointer-events-none"
        @click="close"
      >
        Aplicar Filtros
      </button>
      <button
        class="border border-[var(--secondary)] text-[var(--secondary)] hover:bg-gray-100 font-medium rounded-md text-sm px-5 py-2.5 focus:outline-none transition-all disabled:opacity-50 disabled:pointer-events-none"
        :disabled="!state.q && state.filter === null"
        @click="resetFilter()"
      >
        Limpar Filtros
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TAdsFacetCounts } from '@cmp/shared/models/typesense'
import Combobox from '@/components/Combobox.vue'
import { adsFilterSchema, type TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import { faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { computed, toRefs, unref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{ facetCounts: TAdsFacetCounts, close?: () => void }>()

const state = defineModel<{ filter: TAdsFilter | null, q: string }>({ required: true })

const router = useRouter()
const route = useRoute()
const initialQ = route.params.q ? atob(route.params.q as string) : state.value.q ?? ''

// clean up the url if a q parameter was provided
if (initialQ) {
  state.value.q = initialQ
  router.push({ name: 'anuncios' })
}

const { facetCounts } = toRefs(props)

const marcaFacetCounts = computed(() => {
  const marca = unref(facetCounts).find(facetCount => facetCount.field_name === 'marca')?.counts ?? []
  return marca
})

const estadoFacetCounts = computed(() => {
  const marca = unref(facetCounts).find(facetCount => facetCount.field_name === 'uf')?.counts ?? []
  return marca
})

const validationSchema = toTypedSchema(adsFilterSchema)

const { defineField, validate, values, resetForm } = useForm({ validationSchema, initialValues: state.value.filter })

const [uf] = defineField('uf')
const [marca] = defineField('marca')
const [anoMinimo] = defineField('anoMinimo')
const [anoMaximo] = defineField('anoMaximo')
const [precoMinimo] = defineField('precoMinimo')
const [precoMaximo] = defineField('precoMaximo')
const [quilometragemMinima] = defineField('quilometragemMinima')
const [quilometragemMaxima] = defineField('quilometragemMaxima')
const [pj] = defineField('pj')
const [pf] = defineField('pf')

const commitFilter = async (close?: boolean) => {
  await validate()
  const filter = adsFilterSchema.parse(values)

  state.value.filter = filter
  if (close) {
    props?.close?.()
  }
}

const resetFilter = async () => {
  await resetForm()
  setTimeout(() => {
    state.value = { q: '', filter: null }
  }, 20)
  props?.close?.()
}

watch([values], () => {
  commitFilter()
}, { immediate: true })
</script>
