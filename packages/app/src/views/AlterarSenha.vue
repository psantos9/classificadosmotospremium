<template>
  <div class="view-container">
    <div class="card max-w-screen-md mx-auto">
      <div class="card-header">
        Alterar Senha
      </div>
      <div class="card-section !gap-12">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="password" class="block text-sm/6 font-medium">Senha Atual</label>
              <div class="mt-2 relative">
                <input
                  id="password"
                  v-model="currentPassword"
                  v-bind="currentPasswordAttrs"
                  type="password"
                  autocomplete="off"
                  class="form-input"
                  hidden
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.currentPassword }}
                </p>
              </div>
            </div>
            <div class="hidden sm:block sm:col-span-3" />

            <div class="sm:col-span-3">
              <label for="password" class="block text-sm/6 font-medium">Senha</label>
              <div class="mt-2 relative">
                <input
                  id="password"
                  v-model="password"
                  v-bind="passwordAttrs"
                  type="password"
                  autocomplete="off"
                  class="form-input"
                  hidden
                >
                <p v-if="password && errors.password" class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.password }}
                </p>
                <p v-if="!password" class="absolute text-xs text-gray-400 -bottom-4 right-0">
                  Pelo menos 10 caracteres, maíscula, minúscula, dígito e símbolo.
                </p>
              </div>
            </div>
            <div class="sm:col-span-3">
              <label for="confirm_password" class="block text-sm/6 font-medium">Confirmar Senha</label>
              <div class="mt-2 relative">
                <input
                  id="confirm_password"
                  v-model="confirmPassword"
                  v-bind="confirmPasswordAttrs"
                  type="password"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.confirmPassword }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 md:mt-8 flex justify-between">
          <button
            type="button"
            class="w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md text-[var(--secondary)] border border-[var(--secondary)] px-3.5 py-2.5 text-sm font-semibold shadow-sm"
            @click="$router.push({ name: 'minha-conta' })"
          >
            <FontAwesomeIcon :icon="faArrowLeft" size="lg" />
            Voltar
          </button>
          <button
            type="button"
            class="w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm transition-opacity"
            :class="{
              'opacity-40': submitting || !meta.valid,
            }"
            :disabled="submitting || !meta.valid"
            @click="submit"
          >
            Enviar
            <FontAwesomeIcon :icon="submitting ? faSpinner : faArrowRight" size="lg" :spin="submitting" fixed-width />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UnauthorizedError } from '@/composables/api-client'
import { useApp } from '@/composables/useApp'
import { confirmPasswordSchema, passwordSchema } from '@cmp/shared/models/novo-cadastro'
import { faArrowLeft, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, unref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { z } from 'zod'

const schema = z.object({
  currentPassword: z.string({ required_error: 'Obrigatório' }).nonempty('Obrigatório'),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema
}).superRefine((val, ctx) => {
  let hasIssues = false
  if (val.password !== val.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password', 'confirmPassword'], message: 'As senhas são diferentes' })
    hasIssues = true
  }
  return !hasIssues
})

const toast = useToast()
const { api } = useApp()

const submitting = ref(false)
const validationSchema = toTypedSchema(schema)
const { errors, defineField, values, validate, meta } = useForm({ validationSchema })
const [currentPassword, currentPasswordAttrs] = defineField('currentPassword', { validateOnInput: false, validateOnModelUpdate: false, validateOnChange: false, validateOnBlur: true })
const [password, passwordAttrs] = defineField('password', { validateOnInput: false, validateOnModelUpdate: false, validateOnChange: false, validateOnBlur: true })
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword', { validateOnInput: false, validateOnModelUpdate: false, validateOnChange: false, validateOnBlur: true })

const submit = async () => {
  const { valid } = await validate()
  if (valid) {
    const { password = '', currentPassword = '' } = unref(values)

    try {
      submitting.value = true
      await api.atualizaSenha({ currentPassword, password })
      toast.success('Senha atualizada com sucesso')
      await api.logout()
    }
    catch (err) {
      if (err instanceof UnauthorizedError) {
        toast.error('Senha atual inválida')
      }
      else {
        throw err
      }
    }
    finally {
      submitting.value = false
    }
  }
}
</script>
