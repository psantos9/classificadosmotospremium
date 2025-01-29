<template>
  <div class="flex flex-col items-center">
    <div class="uppercase text-xl md:text-3xl py-6 md:py-8">
      <strong>Últimos</strong>
      <span class="font-light">
        Anúncios
      </span>
    </div>
    <div class="flex-1 container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-start px-4 md:px-2 md:p-0 gap-4">
      <template v-if="loading">
        <div v-for="i in [...Array(10).keys()]" :key="i" class="bg-gray-200 w-full h-full rounded-md border animate-pulse min-h-[335px]" />
      </template>
      <template v-else>
        <VehicleCard
          v-for="hit in anuncios?.hits ?? []"
          :key="hit.document.id"
          :anuncio="hit.document"
          @click="$router.push({ name: 'anuncio', params: { id: hit.document.id } })"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TAdsSearchResponse } from '@cmp/shared/models/typesense'
import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'
import { ref } from 'vue'

const { api } = useApp()
const loading = ref(false)
const anuncios = ref<TAdsSearchResponse | null >(null)
const fetchAds = async () => {
  try {
    loading.value = true
    anuncios.value = await api.fetchAnuncios({ q: '', query_by: ['marca', 'modelo'], sort_by: 'publishedAt:desc', per_page: 30 })
  }
  finally {
    loading.value = false
  }
}

fetchAds()
</script>
