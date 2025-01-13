<template>
  <div class="view-container flex-1 flex flex-col">
    <div class="card flex-1 flex flex-col">
      <div class="flex items-center justify-between p-4 bg-[var(--primary-lightest)]" :data-loading="loading" @click="!loading ? fetchAds() : undefined">
        <span class="text-xl font-black uppercase">
          Meus Anúncios
        </span>
        <div>
          <button
            type="button"
            class="w-full px-3 py-2 text-xs md:text-sm font-medium text-center inline-flex items-center gap-2 text-[var(--primary-text)] bg-[var(--primary)] rounded-md hover:bg-[var(--primary-darker)] focus:outline-none transition-colors"
            @click="$router.push({ name: 'anuncie' })"
          >
            <FontAwesomeIcon :icon="faPlus" />
            <span class="shrink-0">
              Criar Anúncio
            </span>
          </button>
        </div>
      </div>
      <div class="flex-1 flex flex-col items-start gap-2 py-2 px-2 md:px-4 overflow-auto">
        <div
          v-for="ad in ads"
          :key="ad.id"
          class="bg-white w-full p-2 rounded-md shadow flex gap-2 group"
        >
          <div class="flex-1 flex flex-col gap-2">
            <div class="font-bold text-sm md:text-base">
              {{ ad.marca }} {{ ad.modelo }} {{ ad.ano }}/{{ ad.anoModelo }}
            </div>
            <!-- <div>{{ ad.status }} rev{{ ad.revision }}</div> -->
            <div class="flex flex-col text-xs md:text-sm gap-1">
              <div><span class="font-semibold">Valor:</span> {{ Intl.NumberFormat('pr-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(ad.preco) }}</div>
              <div><span class="font-semibold">Data criação:</span> {{ format(ad.createdAt, 'dd/MM/yyyy') }}</div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <AdActionsDropdown
              :ad-id="ad.id"
              @edit="$router.push({ name: 'anuncie', params: { adId: ad.id } })"
              @view="$router.push({ name: 'anuncio', params: { id: ad.id } })"
              @delete="removeAnuncio(ad.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/models'
import AdActionsDropdown from '@/components/AdActionsDropdown.vue'
import { useApp } from '@/composables/useApp'
import { faEdit, faEye, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { format } from 'date-fns'
import { ref } from 'vue'

const { api } = useApp()
const ads = ref<Anuncio[]>([])
const loading = ref(false)
const deletingIndex = ref<Record<string, boolean>>({})

const fetchAds = async () => {
  ads.value = await api.fetchMeusAnuncios()
}

const removeAnuncio = async (adId: number) => {
  try {
    deletingIndex.value[adId] = true
    await api.removeAnuncio(adId)
  }
  finally {
    ads.value = await api.fetchMeusAnuncios()
    delete deletingIndex.value[adId]
  }
}

fetchAds()
</script>
