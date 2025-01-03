<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        O que deseja fazer?
      </div>
      <div class="card-section">
        <span class="text-gray-500">Encontramos anúncios pendentes, você pode retomar o checkout de um anúncio existente ou cadastrar um novo.</span>
        <div class="grid lg:grid-cols-3 gap-4">
          <div
            class="ad-card items-center justify-center !bg-[var(--secondary-lightest)] hover:!bg-[var(--secondary-lighter)] text-[var(--secondary-text)]"
            @click="$router.push({ name: 'anuncie', params: { adId: NOVO_ANUNCIO_ID } })"
          >
            <div class="font-bold uppercase text-center">
              Novo Anúncio
            </div>
          </div>
          <div
            v-for="ad in draftAds"
            :key="ad.id"
            class="ad-card"
            @click="$router.push({ name: 'anuncie', params: { adId: ad.id } })"
          >
            <div class="font-bold">
              {{ ad.marca }} {{ ad.modelo }} {{ ad.ano }}/{{ ad.anoModelo }}
            </div>
            <div class="flex flex-col text-sm gap-1">
              <div><span class="font-semibold">Valor:</span> {{ Intl.NumberFormat('pr-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(ad.preco) }}</div>
              <div><span class="font-semibold">Data criação:</span> {{ format(ad.createdAt, 'dd/MM/yyyy') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/models'
import { useApp } from '@/composables/useApp'
import { NOVO_ANUNCIO_ID } from '@/router'
import { format } from 'date-fns'
import { ref, unref } from 'vue'
import { useRouter } from 'vue-router'

const { api } = useApp()
const router = useRouter()

const draftAds = ref<Anuncio[]>([])

const fetchDraftAds = async () => {
  draftAds.value = await api.fetchMeusAnuncios({ status: 'draft' })
  if (unref(draftAds).length === 0) {
    router.push({ name: 'anuncie' })
  }
}

fetchDraftAds()
</script>

<style scoped>
.ad-card {
  @apply rounded-md shadow p-4 text-base bg-white hover:bg-[var(--primary-lightest)] transition-colors cursor-pointer flex flex-col gap-2;
}
</style>
