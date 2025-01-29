<template>
  <div class="flex-1 md:p-0 md:my-4 md:container md:mx-auto flex flex-col gap-4 items-center md:overflow-y-hidden">
    <div class="hidden md:flex justify-end w-full">
      <SortingDropdown />
    </div>
    <div class="w-full flex-1 md:grid md:grid-cols-[19rem_auto] gap-8 overflow-y-hidden">
      <!-- filtros -->
      <div class="overflow-y-auto hidden md:block py-0.5">
        <AdsFilter
          v-model="filteringState"
          class="shadow"
          :facet-counts="anuncios?.facet_counts ?? []"
        />
      </div>

      <div class="md:hidden flex items-center justify-between p-4 gap-4">
        <SortingDropdown />
        <AdFilterModal v-model="filteringState" :facet-counts="anuncios?.facet_counts ?? []" />
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
import type { SearchParams } from 'typesense/lib/Typesense/Documents'
import AdFilterModal from '@/components/AdFilterModal.vue'
import AdsFilter from '@/components/AdsFilter.vue'
import SortingDropdown from '@/components/SortingDropdown.vue'
import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'
import { useMixpanel } from '@/composables/useMixpanel'
import { TypesenseService } from '@cmp/api/services/typesense-service'
import debounce from 'lodash.debounce'
import { ref, unref, watch } from 'vue'

export interface IAdsState {
  q: string
  filter: TAdsFilter | null
}

const SESSION_STORAGE_KEY = 'CMP:ADS:STATE'
const { api, sortingOption } = useApp()
const { trackBrowseAds } = useMixpanel()

const filteringState = ref<IAdsState>({ q: '', filter: null })
const savedState = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
if (savedState) {
  const _filteringState = JSON.parse(savedState) as IAdsState
  filteringState.value = _filteringState
}

const loading = ref(false)
const anuncios = ref<TAdsSearchResponse | null>(null)

const fetchAds = async (filteringState: IAdsState, sortBy: string = '_text_match:desc') => {
  const { q, filter } = filteringState
  try {
    loading.value = true
    const params: SearchParams = {
      q,
      query_by: 'marca,modelo,uf',
      sort_by: sortBy,
      per_page: 250
    }
    if (filter) {
      params.filter_by = TypesenseService.getFilterByQuery(filter)
    }
    anuncios.value = await api.fetchAnuncios(params)
  }
  finally {
    loading.value = false
  }
}

const debouncedFetchAds = debounce(fetchAds, 500)

watch([filteringState, sortingOption], ([state, sortingOption]) => {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state))
  debouncedFetchAds(state, sortingOption.key)
}, { deep: true })

debouncedFetchAds(unref(filteringState))

trackBrowseAds()
</script>
