<template>
  <div class="view-container flex-1 flex flex-col gap-2 overflow-hidden">
    <div class="flex items-center justify-between p-4 bg-[var(--primary-lightest)] rounded-md">
      <span class="text-xl font-black uppercase">
        Minhas Conversas
      </span>
    </div>
    <div class="flex-1 flex flex-col items-start gap-2 py-2 px-2 md:px-4 overflow-auto rounded-md">
      <ThreadCard
        v-for="thread in threads" :key="thread.id"
        :thread="thread"
        @click="$router.push({ name: 'conversa', params: { id: thread.id } })"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThread } from '@cmp/shared/models/thread'
import ThreadCard from '@/components/ThreadCard.vue'
import { useApp } from '@/composables/useApp'
import { ref, watch } from 'vue'

const { api, unreadMessages } = useApp()
const threads = ref<IThread[]>([])

const fetchThreads = async () => {
  threads.value = await api.fetchThreads()
}

watch(unreadMessages, () => fetchThreads())

fetchThreads()
</script>
