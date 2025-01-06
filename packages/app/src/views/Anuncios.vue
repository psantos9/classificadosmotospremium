<template>
  <div class="flex-1 md:p-0 md:my-4 md:container md:mx-auto flex flex-col gap-4 items-center md:overflow-y-hidden">
    <div class="hidden md:flex justify-end w-full">
      <SortingDropdown />
    </div>
    <div class="w-full flex-1 md:grid md:grid-cols-[19rem_auto] gap-8 overflow-y-hidden">
      <!-- filtros -->
      <div class="overflow-y-auto hidden md:block py-0.5">
        <AdsFilter class="shadow" />
      </div>

      <div class="md:hidden flex items-center justify-end p-4 gap-4">
        <SortingDropdown />
        <AdFilterModal />
      </div>
      <div class="flex-1 grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] overflow-y-auto items-start px-2 md:p-0 gap-2">
        <template v-if="loading">
          <div v-for="i in [...Array(10).keys()]" :key="i" class="bg-gray-200 w-full h-full rounded-md border animate-pulse min-h-[335px]" />
        </template>
        <template v-else>
          <VehicleCard
            v-for="anuncio in anuncios"
            :key="anuncio.id"
            :anuncio="anuncio"
            @click="$router.push({ name: 'anuncio', params: { id: anuncio.id } })"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/models'
import AdFilterModal from '@/components/AdFilterModal.vue'
import AdsFilter from '@/components/AdsFilter.vue'
import SortingDropdown from '@/components/SortingDropdown.vue'
import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'

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
