<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header cursor-pointer data-[loading=true]:pointer-events-none data-[loading=true]:text-[var(--primary)] transition-colors" :data-loading="loading" @click="!loading ? fetchAds() : undefined">
        Meus Anúncios
      </div>
      <div class="grid lg:grid-cols-3 gap-4 p-4">
        <div
          v-for="ad in ads"
          :key="ad.id"
          class="ad-card"
          @click="$router.push({ name: 'anuncie', params: { adId: ad.id } })"
        >
          <div class="font-bold">
            {{ ad.marca }} {{ ad.modelo }} {{ ad.ano }}/{{ ad.anoModelo }}
          </div>
          <div>{{ ad.status }} rev{{ ad.revision }}</div>
          <div class="flex flex-col text-sm gap-1">
            <div><span class="font-semibold">Valor:</span> {{ Intl.NumberFormat('pr-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(ad.preco) }}</div>
            <div><span class="font-semibold">Data criação:</span> {{ format(ad.createdAt, 'dd/MM/yyyy') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { useApp } from '@/composables/useApp'
import { format } from 'date-fns'
import { ref } from 'vue'

const { api } = useApp()
const ads = ref<Anuncio[]>([])
const loading = ref(false)

const fetchAds = async () => {
  ads.value = await api.fetchMeusAnuncios()
}

fetchAds()
</script>

<style scoped>
.ad-card {
  @apply rounded-md shadow p-4 text-base bg-[var(--primary-lightest)] hover:bg-[var(--primary-lightest)] transition-colors cursor-pointer flex flex-col gap-2;
}
</style>
