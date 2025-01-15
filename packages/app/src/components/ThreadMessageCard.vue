<template>
  <div
    class="bg-white rounded-md p-2"
    :class="[message.senderId === Number.parseInt(api.userId ?? '') ? 'self-end' : 'self-start']"
  >
    <div class="text-xs font-extralight">
      {{ timeAgo }}
    </div>
    <div class="text-base font-semibold">
      {{ message.content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import { useApp } from '@/composables/useApp'
import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{ message: IThreadMessage }>()
const { message } = toRefs(props)

const { api } = useApp()

const refDate = ref(new Date())

const timeAgo = computed(() => {
  const timeAgo = formatDistance(new Date(unref(message).createdAt), unref(refDate), { locale: ptBR })
  return timeAgo
})

setInterval(() => {
  refDate.value = new Date()
}, 60 * 1000)
</script>
