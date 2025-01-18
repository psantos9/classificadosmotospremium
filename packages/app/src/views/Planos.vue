<template>
  <div class="view-container">
    <div class="card max-w-screen-md mx-auto">
      <div class="card-header">
        Planos
      </div>
      <div class="card-section">
        {{ anuncio?.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/models'
import { useApp } from '@/composables/useApp'
import { ref, unref } from 'vue'
import { useRouter } from 'vue-router'

const { api } = useApp()
const router = useRouter()

const adId = Number.parseInt(unref(router.currentRoute).params.adId as string)

const anuncio = ref<Anuncio | null>(null)

;(async () => {
  anuncio.value = await api.fetchMeuAnuncio(adId)
})()
</script>
