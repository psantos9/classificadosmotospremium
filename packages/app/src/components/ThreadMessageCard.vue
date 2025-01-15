<template>
  <div
    class="rounded-md p-2 shadow"
    :class="[message.senderId === Number.parseInt(api.userId ?? '') ? 'bg-[var(--primary-lightest)] self-end' : 'bg-white self-start']"
  >
    <div class="flex items-center gap-1">
      <span class="text-xs font-extralight">{{ timeAgo }}</span>
      <FontAwesomeIcon v-if="ownMessage" :icon="faCheck" size="xs" :class="[message.unread ? 'text-[var(--primary-lighter)]' : 'text-green-600']" />
    </div>
    <div class="text-xs">
      {{ message.content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import { useApp } from '@/composables/useApp'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{ message: IThreadMessage }>()
const { message } = toRefs(props)

const { api, signedIn } = useApp()

const refDate = ref(new Date())

const ownMessage = computed(() => {
  if (unref(signedIn) === false) {
    return false
  }
  const ownMessage = unref(message).senderId === Number.parseInt(api.userId ?? '')
  return ownMessage
})

const timeAgo = computed(() => {
  const timeAgo = formatDistance(new Date(unref(message).createdAt), unref(refDate), { locale: ptBR })
  return timeAgo
})

setInterval(() => {
  refDate.value = new Date()
}, 60 * 1000)
</script>
