<template>
  <div class="view-container flex-1 flex flex-col gap-2 overflow-hidden">
    <div class="flex items-center justify-between p-4 bg-[var(--primary-lightest)] rounded-md">
      <span class="text-xl font-black uppercase">
        Minha conversa
      </span>
    </div>
    <div class="flex-1 flex flex-col items-start gap-2 py-2 px-2 md:px-4 overflow-auto rounded-md">
      {{ adId }} {{ email }} {{ threadId }}
    </div>
  </div>
</template>

<script  lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const threadId = route.params.threadId as string
const { adId, email } = JSON.parse(atob(threadId)) as { adId: number, email: string }
</script>
