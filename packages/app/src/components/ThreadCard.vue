<template>
  <div class="w-full bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors p-2 flex flex-col gap-1 text-sm">
    <div class="flex items-center justify-between gap-1">
      <div class="flex items-center gap-1 font-extralight">
        <FontAwesomeIcon :icon="thread.unauthenticatedSender !== null ? faUserSecret : faUser" class="text-[var(--primary)]" size="lg" />
        <span class="font-black text-[var(--primary)]">Conversa com</span>
        <span>{{ typeof threadPartner === 'string' ? threadPartner : threadPartner?.nomeFantasia || threadPartner?.nomeRazaoSocial }}</span>
        <span v-if="typeof threadPartner !== 'string' && threadPartner !== null">({{ threadPartner.email }}) {{ threadPartner.celular }}</span>
      </div>
      <div v-if="!hideTimeago" class="font-extralight">
        {{ timeAgo }}
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-bold hover:underline hover:text-[var(--info)] transition-colors" @click.stop="$router.push({ name: 'anuncio', params: { id: thread.anuncio.id } })">
        {{ thread.anuncio.marca }}
        {{ thread.anuncio.modelo }}
        {{ thread.anuncio.ano }} / {{ thread.anuncio.anoModelo }}
      </span>
      <span v-if="thread.unreadMessages > 0" class="bg-red-600 text-white text-xs font-bold h-5 w-5 rounded-xl shadow flex items-center justify-center">{{ thread.unreadMessages }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThread } from '@cmp/shared/models/thread'
import { useApp } from '@/composables/useApp'
import { faUser, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{ thread: IThread, hideTimeago?: boolean }>()
const { thread } = toRefs(props)

const { api, signedIn } = useApp()
const refDate = ref(new Date())

const threadPartner = computed(() => {
  let userId: string | null = null
  if (unref(signedIn)) {
    userId = api.userId
  }
  const { sender, recipient, unauthenticatedSender, externalRecipient } = unref(thread)
  if (userId === null) {
    return null
  }
  if (sender !== null && sender.id.toString() !== userId) {
    return sender
  }
  else if (recipient !== null && recipient.id.toString() !== userId) {
    return recipient
  }
  return externalRecipient ?? unauthenticatedSender ? `${unauthenticatedSender?.name} (${unauthenticatedSender?.email}) ${unauthenticatedSender?.mobile}` : null
})
const timeAgo = computed(() => {
  const timeAgo = formatDistance(new Date(unref(thread).ultimaAtualizacao as unknown as number * 1000), unref(refDate), { locale: ptBR })
  return timeAgo
})

setInterval(() => {
  refDate.value = new Date()
}, 60 * 1000)
</script>
