<template>
  <div class="view-container bg-gray-200 max-w-screen-md mx-auto p-2 md:p-4 flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden">
    <ThreadCard v-if="thread" :thread="thread" :hide-timeago="true" />

    <div ref="scrollContainer" class="flex-1 flex flex-col items-start gap-2 px-2 overflow-auto rounded-md">
      <ThreadMessageCard
        v-for="message in messages"
        :key="message.id" :message="message"
        :sending="sendingMessageId === message.id"
      />
    </div>
    <div v-if="thread?.unauthenticatedSender" class="bg-white rounded-md p-2 md:p-4 flex flex-col gap-1">
      Esta conversa foi enviada por um usuário não cadastrado, por favor retorne através dos seguintes contatos:<br>
      <div class="flex gap-2 items-center">
        <FontAwesomeIcon :icon="faUser" fixed-width />{{ thread?.unauthenticatedSender.name }}
      </div>
      <div class="flex gap-2 items-center">
        <FontAwesomeIcon :icon="faEnvelope" fixed-width /> {{ thread.unauthenticatedSender.email }}
      </div>
      <div class="flex gap-2 items-center">
        <FontAwesomeIcon :icon="faMobileAlt" fixed-width /> {{ thread.unauthenticatedSender.mobile }}
      </div>
    </div>
    <div v-if="thread?.unauthenticatedSender === null" class="flex items-center gap-2 md:gap-4">
      <input
        v-model="newMessage"
        class="form-input p-4 text-base font-bold"
        @focus="scrollToBottom" @keyup.enter="sendMessage"
      >
      <button
        type="button"
        :disabled="sendingMessage"
        class="h-full aspect-square text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] focus:outline-none rounded-md flex items-center justify-center"
        :class="[sendingMessage ? 'opacity-50 pointer-events-none' : '']"
        @click="sendMessage"
      >
        <FontAwesomeIcon :icon="sendingMessage ? faSpinner : faPaperPlane" :spin="sendingMessage" fixed-width size="xl" />
      </button>
    </div>
    <div ref="turnstileContainer" class="fixed bottom-0 right-0" />
  </div>
</template>

<script  lang="ts" setup>
import type { IAuthenticatedMessageSender } from '@cmp/shared/models/authenticated-message-sender'
import type { NovaMensagem } from '@cmp/shared/models/nova-mensagem'
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import type { TAdDocument } from '@cmp/shared/models/typesense'
import ThreadCard from '@/components/ThreadCard.vue'
import ThreadMessageCard from '@/components/ThreadMessageCard.vue'
import { useApp } from '@/composables/useApp'
import { getTurnstileToken } from '@/helpers/getTurnstileToken'
import { faEnvelope, faMobile, faMobileAlt, faPaperPlane, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useRoute } from 'vue-router'

const { api, unreadMessages, threads } = useApp()
const route = useRoute()
const threadId = route.params.id as string

const scrollContainer = ref<HTMLElement | null>(null)
const turnstileContainer = ref<HTMLElement | null>(null)

const adDocument = ref<TAdDocument | null>(null)

const newMessage = ref('')
const messages = ref<IThreadMessage[]>([])
const sendingMessage = ref(false)
const sendingMessageId = ref<number | null>(null)

const anuncio = computed(() => unref(messages)?.[0]?.anuncio ?? null)
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

const addMessageToThread = (message: NovaMensagem) => {
  const { adId, recipient, unauthenticatedSender = null, content } = message

  const messageId = unref(messages).reduce((accumulator, message) => {
    if (message.id < accumulator) {
      accumulator = message.id - 1
    }
    return accumulator
  }, 0)

  const threadMessage: IThreadMessage = {
    id: messageId,
    createdAt: new Date(),
    adId,
    unread: true,
    threadId,
    senderId: Number.parseInt(api.userId ?? '-1'),
    sender: {} as IAuthenticatedMessageSender,
    recipientEmail: typeof recipient === 'string' ? recipient : null,
    recipientId: typeof recipient === 'number' ? recipient : null,
    unauthenticatedSender,
    anuncio: unref(anuncio),
    content
  }
  unref(messages).push(threadMessage)

  return messageId
}

const scrollToBottom = () => {
  const el = unref(scrollContainer)
  el?.scrollTo({ top: el.scrollHeight ?? 0, behavior: 'smooth' })
}

const sendMessage = async () => {
  const turnstileEl = unref(turnstileContainer)
  if (turnstileEl === null) {
    throw new Error('no turnstile container')
  }
  if (api.userId === null) {
    return
  }
  const recipient = unref(threadPartnerId)
  if (recipient === null) {
    return
  }
  const _anuncio = unref(anuncio)
  const adId = unref(anuncio).id
  const content = unref(newMessage)
  if (!content) {
    return
  }
  newMessage.value = ''
  try {
    sendingMessage.value = true
    const novaMensagem: NovaMensagem = { adId, threadId, recipient, content }
    sendingMessageId.value = addMessageToThread(novaMensagem)
    const token = await getTurnstileToken({ el: turnstileEl, siteKey: __CLOUDFLARE_TURNSTILE_SITEKEY__ })
    await api.enviaMensagem(unref(adDocument) as TAdDocument, { ...novaMensagem, token })
  }
  catch (err) {
    unref(messages).pop()
    throw err
  }
  finally {
    sendingMessageId.value = null
    sendingMessage.value = false
  }
}

const fetchThreadMessages = async () => {
  messages.value = await api.fetchThread(threadId)
}

watch(unreadMessages, () => fetchThreadMessages())
watch(messages, () => nextTick(() => scrollToBottom()), { immediate: true, deep: true })
watch(anuncio, async (anuncio) => {
  if (anuncio === null || unref(adDocument) !== null) {
    return
  }
  adDocument.value = await api.fetchAnuncio(anuncio.id)
}, { immediate: true, deep: true })

fetchThreadMessages()
</script>
