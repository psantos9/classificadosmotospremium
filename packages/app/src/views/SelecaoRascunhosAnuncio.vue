<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        O que deseja fazer?
      </div>
      <div class="card-section">
        <span class="">Encontramos anúncios pendentes, você pode retomar o checkout de um anúncio existente ou cadastrar um novo.</span>
        <div class="flex flex-col">
          <div
            v-for="ad in draftAds"
            :key="ad.id"
            class="rounded-md shadow p-4 text-sm bg-white hover:bg-[var(--primary-lighter)] transition-colors cursor-pointer flex flex-col"
          >
            {{ ad.codigoFipe }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { useApp } from '@/composables/useApp'
import { ref } from 'vue'

const { api } = useApp()
const draftAds = ref<Anuncio[]>([])

const fetchDraftAds = async () => {
  draftAds.value = await api.fetchAnuncios({ status: 'draft' })
}

fetchDraftAds()
</script>
