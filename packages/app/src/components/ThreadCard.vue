<template>
  <div class="w-full bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors p-2 flex flex-col gap-1 text-sm">
    <div class="flex items-center justify-between gap-1">
      <div class="flex items-center gap-1 font-extralight">
        <span>{{ thread.sender?.nomeFantasia || thread.sender?.nomeRazaoSocial || thread.unauthenticatedSender?.name }}</span>
        <span>({{ thread.sender?.email || thread.unauthenticatedSender?.email }})</span>
      </div>
      <div class="font-extralight">
        {{ timeAgo }}
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-bold hover:underline hover:text-[var(--info)] transition-colors" @click.stop="$router.push({ name: 'anuncio', params: { id: thread.anuncio.id } })">
        {{ thread.anuncio.marca }}
        {{ thread.anuncio.modelo }}
        {{ thread.anuncio.ano }} / {{ thread.anuncio.anoModelo }}
      </span>
      <span class="bg-[var(--primary)] text-[var(--text-primary)] text-xs font-bold px-1 py-0.5 rounded-xl shadow">{{ thread.unreadMessages }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThread } from '@cmp/shared/models/thread'
import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{ thread: IThread }>()
const { thread } = toRefs(props)
const refDate = ref(new Date())

const timeAgo = computed(() => {
  const timeAgo = formatDistance(new Date(unref(thread).ultimaAtualizacao as unknown as number * 1000), unref(refDate), { locale: ptBR })
  return timeAgo
})

setInterval(() => {
  refDate.value = new Date()
}, 60 * 1000)
</script>
