<template>
  <div class="flex-1 md:p-0 md:my-8 md:container md:mx-auto flex flex-col gap-8 items-center md:overflow-y-hidden">
    <div class="hidden md:block uppercase text-2xl font-black tracking-wide text-center">
      Anúncio de veículos
    </div>
    <div class="w-full flex-1 md:grid md:grid-cols-[19rem_auto] gap-8 overflow-y-hidden">
      <!-- filtros -->
      <div class="overflow-y-auto bg-white shadow rounded-md hidden md:flex flex-col divide-y">
        <div class="flex flex-col items-center p-4 gap-2">
          <FontAwesomeIcon :icon="faFilter" size="2xl" class="text-[var(--primary)]" />
          <span class="uppercase font-black">Filtrar anúncios</span>
        </div>
        <div>ano veiculo</div>
        <div>preco veiculo</div>
        <div>quilometragem veiculo</div>
        <div>Aplicad filtros</div>
      </div>
      <div class="md:hidden flex items-center justify-end p-4 gap-4">
        <SortingDropdown />
        <AdFilterModal />
      </div>
      <div class="flex-1 grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] overflow-y-auto items-start px-2 md:p-0">
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
  <Transition
    enter-active-class="transition-opacity"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="y > 0"
      type="button"
      class="md:hidden fixed bottom-0 right-0 w-10 h-10 m-2 shadow-md bg-[var(--primary)] hover:bg-[var(--primary-darker)] text-[var(--primary-text)] focus:outline-none rounded-full p-2.5 text-center inline-flex items-center"
      @click="scrollToTop"
    >
      <FontAwesomeIcon :icon="faArrowUp" fixed-width size="xl" />
    </button>
  </Transition>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/models'
import AdFilterModal from '@/components/AdFilterModal.vue'
import SortingDropdown from '@/components/SortingDropdown.vue'
import VehicleCard from '@/components/VehicleCard.vue'
import { useApp } from '@/composables/useApp'
import { faArrowUp, faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useScroll } from '@vueuse/core'
import { ref } from 'vue'

const scrollContainer = ref(document.querySelector('.scroll-container') as HTMLElement)
const { y } = useScroll(scrollContainer)
const { api, scrollToTop } = useApp()
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
