<template>
  <span class="mt-4 title mx-auto">Insira seu email</span>
  <div class="max-w-[250px] w-full mx-auto relative flex items-center">
    <input
      ref="emailEl"
      v-model="email"
      v-bind="emailAttrs"
      class="block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:pl-9 sm:text-sm/6 lowercase"
      placeholder="E-mail"
      :invalid="!!errors.email"
    >
    <FontAwesomeIcon :icon="faEnvelope" size="sm" class="absolute pointer-events-none top-1/2 -translate-y-1/2 left-3 text-gray-400" />
    <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
      {{ errors.email }}
    </p>
  </div>

  <button
    :disabled="!email || loading"
    type="button"
    class="mt-4 w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm"
    :class="[loading ? 'pointer-events-none' : '']"
    @click="validateEmail"
  >
    Confirmar
    <FontAwesomeIcon :icon="loading ? faSpinner : faArrowRight" :spin="loading" size="lg" />
  </button>
  <div ref="turnstileContainer" class="absolute bottom-0" />
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { getTurnstileToken } from '@/helpers/getTurnstileToken'
import { faArrowRight, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { z } from 'zod'

const emit = defineEmits<{ (e: 'emailVerified', payload: { email: string, exists: boolean }): void }>()

const { api } = useApp()

const emailEl = ref<null | HTMLInputElement>(null)
const loading = ref(false)
const turnstileContainer = ref<null | HTMLInputElement>(null)

const validationSchema = toTypedSchema(z.object({ email: z.string({ required_error: 'Obrigatório' }).email('E-mail inválido') }))
const { errors, defineField, validate, meta } = useForm({ validationSchema })

const [email, emailAttrs] = defineField('email', { validateOnModelUpdate: false })

const validateEmail = async () => {
  await validate()
  if (!unref(meta).valid) {
    return
  }
  const turnstileEl = unref(turnstileContainer)
  if (turnstileEl === null) {
    return
  }
  loading.value = true
  const token = await getTurnstileToken({ el: turnstileEl, siteKey: __CLOUDFLARE_TURNSTILE_SITEKEY__ })
  const _email = unref(email)?.toLowerCase() as string
  try {
    const exists = await api.validateEmail({ email: _email, token })
    emit('emailVerified', { email: _email, exists })
  }
  finally {
    loading.value = false
  }
}

const keydownEventHandler = async (evt: KeyboardEvent) => {
  if (unref(loading)) {
    return
  }
  const { key } = evt
  if (key === 'Enter') {
    await validateEmail()
  }
}

window.addEventListener('keydown', keydownEventHandler)
onBeforeUnmount(() => window.removeEventListener('keydown', keydownEventHandler))
onMounted(() => {
  unref(emailEl)?.focus()
})
</script>
