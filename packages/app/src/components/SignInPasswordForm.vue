<template>
  <span class="mt-4 title mx-auto">Insira a senha</span>
  <div class="max-w-[250px] w-full mx-auto relative flex items-center">
    <input
      ref="passwordEl"
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      class="block w-full rounded-md bg-white py-1.5 pl-10 pr-10 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:pl-9 sm:text-sm/6"
    >
    <FontAwesomeIcon :icon="faKey" size="sm" class="absolute pointer-events-none top-1/2 -translate-y-1/2 left-3 text-gray-400" />
    <div class="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 cursor-pointer" @click="showPassword = !showPassword">
      <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" size="sm" />
    </div>
  </div>
  <button
    :disabled="!password"
    type="button"
    class="mt-4 w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm"
    @click="submit"
  >
    Confirmar
    <FontAwesomeIcon :icon="loading ? faSpinner : faArrowRight" :spin="loading" size="lg" />
  </button>
  <span class="font-extralight text-xs text-[var(--info)] hover:underline cursor-pointer" @click="$emit('back')">Usar outra forma de entrada</span>
  <div ref="turnstileContainer" />
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { getTurnstileToken } from '@/helpers/getTurnstileToken'
import { UnauthorizedError } from '@/services/api-client'
import { faArrowRight, faEye, faEyeSlash, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onBeforeUnmount, onMounted, ref, toRefs, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const props = defineProps<{ email: string }>()
defineEmits<{
  (e: 'back'): void
}>()
const turnstileContainer = ref<HTMLElement | null>(null)
const router = useRouter()
const { email } = toRefs(props)
const { api } = useApp()
const toast = useToast()

const passwordEl = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const password = ref('')
const showPassword = ref(false)

const submit = async () => {
  const turnstileEl = unref(turnstileContainer)
  if (turnstileEl === null) {
    throw new Error('no turnstile container')
  }

  loading.value = true
  try {
    const token = await getTurnstileToken({ el: turnstileEl, siteKey: __CLOUDFLARE_TURNSTILE_SITEKEY__ })
    await api.login({ email: unref(email), password: unref(password), token })
    router.push({ name: 'home' })
  }
  catch (err) {
    if (err instanceof UnauthorizedError) {
      password.value = ''
      toast.error('Senha inválida', { duration: 1000 })
    }
    else { throw err }
  }
  finally {
    loading.value = false
  }
}

const keydownEventHandler = async (evt: KeyboardEvent) => {
  const { key } = evt
  if (key === 'Enter') {
    await submit()
  }
}

window.addEventListener('keydown', keydownEventHandler)
onBeforeUnmount(() => window.removeEventListener('keydown', keydownEventHandler))

onMounted(() => {
  unref(passwordEl)?.focus()
})
</script>
