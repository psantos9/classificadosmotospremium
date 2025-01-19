<template>
  <div class="w-full rounded-md shadow border p-4 flex flex-col items-center gap-4 bg-gray-100 ">
    <div class="text-lg font-black">
      Enviar proposta
    </div>
    <div class="grid gap-3 md:grid-cols-2 w-full">
      <template v-if="!signedIn">
        <div class="col-span-full relative">
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label>
          <input v-model="name" class="form-input" v-bind="nameAttrs">
          <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
            {{ errors.name }}
          </p>
        </div>
        <div class="relative">
          <label for="mobile" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefone</label>
          <input
            v-model="mobile"
            v-maska="{ mask: '(##) #########' }"
            v-bind="mobileAttrs"
            class="form-input"
          >
          <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
            {{ errors.mobile }}
          </p>
        </div>
        <div class="relative">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
          <input id="email" v-model="email" class="form-input" v-bind="emailAttrs">
          <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
            {{ errors.email }}
          </p>
        </div>
      </template>

      <div class="col-span-full">
        <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mensagem</label>
        <textarea
          v-model="message"
          rows="4"
          class="form-input w-full" :placeholder="`Gostei do seu anúncio da ${anuncio?.marca} ${anuncio?.modelo} e gostaria de mais informações.`"
        />
      </div>
    </div>
    <div class="mt-4 flex justify-center items-center">
      <button
        type="button"
        :disabled="sendingMessageDisabled"
        class="flex items-center justify-center gap-1 text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none transition-all"
        :class="[sendingMessageDisabled ? 'opacity-70 pointer-events-none' : '']"
        @click="enviarMensagem"
      >
        Enviar mensagem
        <FontAwesomeIcon :icon="sendingMessage ? faSpinner : faChevronRight" :spin="sendingMessage" fixed-width />
      </button>
    </div>
    <div ref="turnstileContainer" class="fixed bottom-0 right-0" />
  </div>
</template>

<script lang="ts" setup>
import type { TAdDocument } from '@cmp/shared/models/typesense'
import { useApp } from '@/composables/useApp'
import { getTurnstileToken } from '@/helpers/getTurnstileToken'
import { getUnauthenticatedMessageSenderSchema } from '@cmp/shared/models/nova-mensagem'
import { faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { computed, ref, toRefs, unref } from 'vue'
import { useToast } from 'vue-toast-notification'

const props = defineProps<{ anuncio: TAdDocument }>()
const { anuncio } = toRefs(props)

const toast = useToast()
const { api, signedIn } = useApp()

const anonymousMessageSenderSchema = toTypedSchema(getUnauthenticatedMessageSenderSchema())

const { errors, defineField, values, meta, resetForm } = useForm({
  validationSchema: anonymousMessageSenderSchema
})

const [email, emailAttrs] = defineField('email', { validateOnInput: false, validateOnModelUpdate: false, validateOnChange: false, validateOnBlur: true })
const [mobile, mobileAttrs] = defineField('mobile')
const [name, nameAttrs] = defineField('name')

const message = ref('')
const sendingMessage = ref(false)

const turnstileContainer = ref<HTMLElement | null>(null)

const sendingMessageDisabled = computed(() => {
  const _signedIn = unref(signedIn)
  const content = unref(message)
  const sending = unref(sendingMessage)
  const { valid, touched } = unref(meta)
  const disabled = sending || !content || (!_signedIn && !touched && !valid)
  return disabled
})

const enviarMensagem = async () => {
  const turnstileEl = unref(turnstileContainer)
  if (turnstileEl === null) {
    throw new Error('can not send message, no turnstile container')
  }
  const _anuncio = unref(anuncio) ?? null
  if (_anuncio === null) {
    return
  }
  const adId = _anuncio.id
  const content = unref(message)
  const unauthenticatedSender = !unref(signedIn) ? getUnauthenticatedMessageSenderSchema().parse(unref(values)) : undefined
  try {
    sendingMessage.value = true
    const token = await getTurnstileToken({ el: turnstileEl, siteKey: __CLOUDFLARE_TURNSTILE_SITEKEY__ })
    await api.enviaMensagem(_anuncio, { adId: Number.parseInt(adId), content, unauthenticatedSender, token })
    toast.success('Mensagem enviada com sucesso!')
    message.value = ''
    resetForm()
  }
  finally {
    sendingMessage.value = false
  }
}
</script>
