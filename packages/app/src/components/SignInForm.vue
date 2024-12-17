<template>
  <span class="mt-4 title mx-auto">Insira seu email</span>
  <div class="max-w-[250px] w-full mx-auto relative flex items-center">
    <input
      v-model="email"
      v-bind="emailAttrs"
      class="block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:pl-9 sm:text-sm/6"
      placeholder="E-mail"
      :class="[!errors.email ? 'outline-gray-300 focus:outline-[var(--primary)]' : 'outline-red-500 focus:outline-red-500']"
      :invalid="!!errors.email"
    >
    <FontAwesomeIcon :icon="faEnvelope" size="sm" class="absolute pointer-events-none top-1/2 -translate-y-1/2 left-3 text-gray-400" />
    <p class="absolute text-xs text-red-600 -bottom-4 right-0">
      {{ errors.email }}
    </p>
  </div>

  <button
    :disabled="!email"
    type="button"
    class="mt-4 w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm"
    :class="{
      'opacity-50': !email || loading || errors.email,
    }"
    @click="validateEmail"
  >
    Confirmar
    <FontAwesomeIcon :icon="loading ? faSpinner : faArrowRight" :spin="loading" size="lg" />
  </button>
</template>

<script lang="ts" setup>
import { faArrowRight, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, unref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const loading = ref(false)
const validationSchema = toTypedSchema(z.object({ email: z.string().email('E-mail inválido').optional() }))
const { errors, defineField, validate, meta } = useForm({ validationSchema })

const [email, emailAttrs] = defineField('email', { validateOnModelUpdate: false })

const validateEmail = async () => {
  await validate()
  if (!unref(meta).valid) {
    return
  }
  loading.value = true
  try {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
  }
  finally {
    loading.value = false
  }
}
</script>
