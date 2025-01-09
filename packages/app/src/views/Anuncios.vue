<template>
  <div class="flex-1 md:p-0 md:my-4 md:container md:mx-auto flex flex-col gap-4 items-center md:overflow-y-hidden">
    <div class="hidden md:flex justify-end w-full">
      <SortingDropdown />
    </div>
    <div class="w-full flex-1 md:grid md:grid-cols-[19rem_auto] gap-8 overflow-y-hidden">
      <!-- filtros -->
      <div class="overflow-y-auto hidden md:block py-0.5">
        <AdsFilter
          class="shadow"
          v-model="filter"
          :facet-counts="anuncios?.facet_counts ?? []"
          @update-filter="filter = $event"
          @update-q="q = $event"
        />
      </div>

      <div class="md:hidden flex items-center justify-between p-4 gap-4">
        <SortingDropdown />
        <AdFilterModal />
      </div>
      <div class="flex-1 flex-col overflow-y-auto">
        <div class="flex-1 grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] items-start px-4 md:px-2 md:p-0 gap-4 md:gap-2">
          <VehicleCard
            v-for="hit in anuncios?.hits ?? []"
            :key="hit.document.id"
            :anuncio="hit.document"
            @click="$router.push({ name: 'anuncio', params: { id: hit.document.id } })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import type { TAdsSearchResponse } from '@cmp/shared/models/typesense'
import AdFilterModal from '@/components/AdFilterModal.vue'
import AdsFilter from '@/components/AdsFilter.vue'
import SortingDropdown from '@/components/SortingDropdown.vue'

import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'
import debounce from 'lodash.debounce'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export interface IAdsState {
  q: string
  filter: TAdsFilter | null
}

const SESSION_STORAGE_KEY = 'CMP:ADS:STATE'
const route = useRoute()
const { api } = useApp()

const savedState = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
let sessionState: IAdsState | null = null
if (savedState) {
  sessionState = JSON.parse(savedState)
}
console.log('GOT STATE', sessionState)

const q = ref(route.params.q || sessionState?.q || '')
const filter = ref<TAdsFilter | null>(sessionState?.filter ?? null)
const loading = ref(false)
const anuncios = ref<TAdsSearchResponse | null>(null)

const fetchAds = async (q?: string, filter?: TAdsFilter) => {
  try {
    loading.value = true
    anuncios.value = await api.fetchAnuncios({ filter, q, queryBy: ['marca', 'modelo', 'uf'] })
  }
  finally {
    loading.value = false
  }
}

const debouncedFetchAds = debounce(fetchAds, 500)

watch([q, filter], ([q, filter]) => {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ q, filter }))
  debouncedFetchAds(q, filter ?? undefined)
}, { immediate: true })
</script>
