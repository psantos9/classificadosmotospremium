<template>
  <div class="view-container flex-1 flex flex-col gap-2 overflow-hidden">
    <div class="flex items-center justify-between p-4 bg-[var(--primary-lightest)] rounded-md">
      <span class="text-xl font-black uppercase">
        Minha conversa
      </span>
    </div>
    <ThreadCard v-if="thread" :thread="thread" />

    <div ref="scrollContainer" class="flex-1 flex flex-col items-start gap-2 py-2 px-2 md:px-4 overflow-auto rounded-md">
      <ThreadMessageCard
        v-for="message in messages"
        :key="message.id" :message="message"
      />
    </div>
    <div class="flex items-center gap-2">
      <input
        v-model="newMessage"
        type="text"
        class="form-input p-4 text-base font-bold"
        @focus="scrollToBottom" @keyup.enter="sendMessage"
      >
      <button
        type="button"
        class="h-full aspect-square text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] focus:outline-none rounded-md flex items-center justify-center"
        @click="sendMessage"
      >
        <FontAwesomeIcon :icon="faPaperPlane" fixed-width size="xl" />
      </button>
    </div>
  </div>
</template>

<script  lang="ts" setup>
import type { NovaMensagem } from '@cmp/shared/models/nova-mensagem'
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import ThreadCard from '@/components/ThreadCard.vue'
import ThreadMessageCard from '@/components/ThreadMessageCard.vue'
import { useApp } from '@/composables/useApp'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref, unref, watch } from 'vue'
import { useRoute } from 'vue-router'

const { api, unreadMessages, threads } = useApp()
const route = useRoute()
const threadId = route.params.id as string

const scrollContainer = ref<HTMLElement | null>(null)

const newMessage = ref('')
const messages = ref<IThreadMessage[]>([])

const anuncio = computed(() => unref(messages)?.[0]?.anuncio ?? 0)
const thread = computed(() => unref(threads).find(thread => thread.id === threadId))

const threadPartnerId = computed(() => {
  if (unref(messages).length === 0) {
    return null
  }
  const refMessage = unref(messages)?.[0]
  const { senderId, recipientId, unauthenticatedSender } = refMessage
  const id = recipientId !== Number.parseInt(api.userId ?? '') ? recipientId : senderId || unauthenticatedSender?.email || null
  return id
})

const fetchThreadMessages = async () => {
  messages.value = await api.fetchThread(threadId)
}

const sendMessage = async () => {
  if (api.userId === null) {
    return
  }
  const recipient = unref(threadPartnerId)
  if (recipient === null) {
    return
  }
  const adId = unref(anuncio).id
  const content = unref(newMessage)
  const novaMensagem: NovaMensagem = {
    adId,
    threadId,
    recipient,
    content
  }
  await api.enviaMensagem(novaMensagem)
  newMessage.value = ''
}

const scrollToBottom = () => {
  const el = unref(scrollContainer)
  el?.scrollTo({ top: el.scrollHeight ?? 0, behavior: 'smooth' })
}

watch(unreadMessages, () => fetchThreadMessages())
watch(messages, scrollToBottom, { immediate: true })

fetchThreadMessages()
</script>
