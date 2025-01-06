<template>
  <div class="flex flex-col items-center">
    <div class="uppercase text-xl md:text-3xl py-6 md:py-8">
      <span class="font-light">
        Anúncios em
      </span>
      <strong>destaque</strong>
    </div>
    <div class="flex flex-wrap gap-4 overflow-y-auto items-start w-full md:container md:mx-auto px-4 pb-4">
      <template v-if="loading">
        <div v-for="i in [...Array(10).keys()]" :key="i" class="bg-gray-200 w-full h-full rounded-md border animate-pulse min-h-[335px]" />
      </template>
      <template v-else>
        <VehicleCard
          v-for="anuncio in anuncios"
          :key="anuncio.id"
          :anuncio="anuncio"
          class="w-full md:w-[250px]"
          @click="$router.push({ name: 'anuncio', params: { id: anuncio.id } })"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/models'
import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

const { api } = useApp()
const loading = ref(false)
const anuncios = ref<PublicAd[]>([])
const fetchAds = async () => {
  try {
    loading.value = true
    anuncios.value = await api.fetchAnuncios()
  }
  finally {
    loading.value = false
  }
}

fetchAds()
</script>
