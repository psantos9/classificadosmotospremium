<template>
  <div class="bg-white shadow rounded-md h-auto flex flex-col overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
    <div class="overflow-hidden bg-black">
      <img :src="api.getImageUrl({ imageId: anuncio.fotos[0], thumbnail: true })" class="h-full w-full aspect-[4/3] object-cover transition-all duration-200">
    </div>
    <div class="flex flex-col p-4 text-sm gap-2">
      <span class="font-bold text-base">{{ anuncio.marca }}</span>
      <span>{{ anuncio.modelo }}</span>
      <span class="text-xs">
        <FontAwesomeIcon :icon="faCalendarAlt" />
        {{ anuncio.ano }}/{{ anuncio.anoModelo }}
      </span>
      <span class="text-xs">
        <FontAwesomeIcon :icon="faTachometerAlt" />
        {{ new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.quilometragem) }} km
      </span>

      <span class="py-1 font-black text-[var(--primary-lighter)] group-hover:text-[var(--primary)] transition-colors text-2xl">
        {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.preco) }}
      </span>
      <div class="mt-1 flex gap-2 items-center">
        <FontAwesomeIcon :icon="faLocationDot" />
        <span>{{ anuncio.localidade }} / {{ anuncio.uf }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TAdDocument } from '@cmp/shared/models/typesense'
import { useApp } from '@/composables/useApp'
import { faCalendarAlt, faLocationDot, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{ anuncio: TAdDocument }>()
const { api } = useApp()
</script>
