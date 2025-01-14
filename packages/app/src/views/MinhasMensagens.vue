<template>
  <div class="view-container flex-1 flex flex-col gap-2 overflow-hidden">
    <div class="flex items-center justify-between p-4 bg-[var(--primary-lightest)] rounded-md">
      <span class="text-xl font-black uppercase">
        Minhas Mensagens
      </span>
    </div>
    <div class="flex-1 flex flex-col items-start gap-2 py-2 px-2 md:px-4 overflow-auto rounded-md">
      <ThreadCard v-for="(thread, i) in threads" :key="i" :thread="thread" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { IThread } from '@cmp/shared/models/thread'
import ThreadCard from '@/components/ThreadCard.vue'
import { useApp } from '@/composables/useApp'
import { ref, watch } from 'vue'

export interface IAdThread {
  adId: string
  ad: Anuncio
}
const { api, unreadMessages } = useApp()
const threads = ref<IThread[]>([])

const fetchThreads = async () => {
  threads.value = await api.fetchThreads()
}

watch(unreadMessages, () => fetchThreads())

fetchThreads()
</script>
