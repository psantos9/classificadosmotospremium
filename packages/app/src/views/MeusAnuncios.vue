<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header cursor-pointer data-[loading=true]:pointer-events-none data-[loading=true]:text-[var(--primary)] transition-colors" :data-loading="loading" @click="!loading ? fetchAds() : undefined">
        Meus Anúncios {{ loading }}
      </div>
      <div class="flex flex-col">
        <pre v-for="anuncio in anuncios" :key="anuncio.id" class="text-xs">
          {{ anuncio }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { useApp } from '@/composables/useApp'
import { ref } from 'vue'

const { api } = useApp()
const anuncios = ref<Anuncio[]>([])
const loading = ref(false)

const fetchAds = async () => {
  anuncios.value = await api.fetchAnuncios()
}

fetchAds()
</script>
