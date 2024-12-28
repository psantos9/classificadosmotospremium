<template>
  <div class="bg-white shadow rounded-md h-auto flex flex-col overflow-hidden">
    <img :src="api.getImageUrl(anuncio.fotos[0])" class="h-[150px] object-cover">
    <div class="flex flex-col p-4 text-sm gap-1">
      <span class="font-extralight">{{ anuncio.ano }}/{{ anuncio.anoModelo }} - {{ anuncio.quilometragem }}km</span>
      <span class="font-bold">{{ anuncio.marca }}</span>
      <span>{{ anuncio.modelo }}</span>
      <span class="font-black text-[var(--primary)] text-xl">
        {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.preco) }}
      </span>
      <div class="mt-2">
        <FontAwesomeIcon :icon="faLocationDot" />
        <span>Brasília DF</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { useApp } from '@/composables/useApp'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{ anuncio: Anuncio }>()
const { api } = useApp()
</script>
