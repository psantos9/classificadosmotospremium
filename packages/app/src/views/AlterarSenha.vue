<template>
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
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                autocomplete="off"
                class="form-input"
                hidden
              >
              <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                {{ errors.password }}
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
              <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                {{ errors.password }}
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
            'opacity-40': !hasChanges || !meta.valid,
          }"
          :disabled="!hasChanges"
          @click="submit"
        >
          Enviar
          <FontAwesomeIcon :icon="faArrowRight" size="lg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Cadastro } from '@cmp/database/schema'
import { CpfCnpjConflictError, EmailConflictError } from '@/composables/api-client'
import { useApp } from '@/composables/useApp'
import { atualizaCadastroSchema } from '@cmp/shared/models/atualiza-cadastro'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { sha256 } from 'js-sha256'
import debounce from 'lodash.debounce'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'

enum EntityType {
  PF = 'pf',
  PJ = 'pj'
}
const $toast = useToast()
const { api } = useApp()
const cadastroId = ref('')
const originalHash = ref('')
const tipoEntidade = ref<EntityType | null>(null)
const validationSchema = toTypedSchema(atualizaCadastroSchema)
const { errors, defineField, values, setFieldError, validate, setFieldValue, meta } = useForm({ validationSchema })
const [cpfCnpj, cpfCnpjAttrs] = defineField('cpfCnpj')
const [nomeRazaoSocial, nomeRazaoSocialAttrs] = defineField('nomeRazaoSocial')
const [nomeFantasia, nomeFantasiaAttrs] = defineField('nomeFantasia')
const [dataNascimento, dataNascimentoAttrs] = defineField('dataNascimento')
const [email, emailAttrs] = defineField('email')
const [celular, celularAttrs] = defineField('celular')
const [cep, cepAttrs] = defineField('cep')
const [logradouro, logradouroAttrs] = defineField('logradouro')
const [complemento, complementoAttrs] = defineField('complemento')
const [numero, numeroAttrs] = defineField('numero')
const [bairro, bairroAttrs] = defineField('bairro')
const [localidade, localidadeAttrs] = defineField('localidade')
const [uf, ufAttrs] = defineField('uf')

const syncCadastro = async (_cadastro?: Omit<Cadastro, 'password'>) => {
  if (!_cadastro) {
    _cadastro = await api.fetchCadastro()
  }
  const { id, cpfCnpj, nomeRazaoSocial, email, celular, cep, logradouro, numero, complemento, bairro, localidade, uf, dataNascimento } = _cadastro
  cadastroId.value = id
  setFieldValue('nomeRazaoSocial', nomeRazaoSocial)
  setFieldValue('cpfCnpj', cpfCnpj)
  setFieldValue('email', email)
  setFieldValue('dataNascimento', dataNascimento ?? '')
  setFieldValue('celular', celular)
  setFieldValue('cep', cep)
  setFieldValue('logradouro', logradouro)
  setFieldValue('numero', numero ?? '')
  setFieldValue('complemento', complemento)
  setFieldValue('bairro', bairro)
  setFieldValue('localidade', localidade)
  setFieldValue('uf', uf)
  nextTick(() => {
    originalHash.value = sha256(JSON.stringify(unref(values)))
  })
}

const hasChanges = computed(() => unref(originalHash) !== sha256(JSON.stringify(unref(values))))

syncCadastro()

const submit = async () => {
  const { valid } = await validate()
  if (valid) {
    const cadastro = JSON.parse(JSON.stringify(unref(values)))
    try {
      const cadastroAtualizado = await api.atualizaCadastro({ id: unref(cadastroId), cadastro })
      await syncCadastro(cadastroAtualizado)
      $toast.success('Dados atualizados com sucesso')
    }
    catch (err) {
      if (err instanceof CpfCnpjConflictError) {
        setFieldError('cpfCnpj', `Já existe uma conta com este ${tipoEntidade.value === EntityType.PF ? 'CPF' : 'CNPj'}`)
      }
      else if (err instanceof EmailConflictError) {
        setFieldError('email', 'Já existe uma conta com este e-mail')
      }
    }
  }
}

const debouncedValidateCEP = debounce(async (cep: string) => {
  const cepOk = unref(errors).cep === undefined
  if (!cepOk) {
    return
  }
  const openCEP = await api.validateCEP(cep)
  if (openCEP !== null) {
    logradouro.value = openCEP.logradouro
    complemento.value = openCEP.complemento
    bairro.value = openCEP.bairro
    localidade.value = openCEP.localidade
    uf.value = openCEP.uf
  }
  else {
    setFieldError('cep', 'CEP inválido')
  }
}, 500)

watch(cep, async () => {
  await debouncedValidateCEP(unref(cep)?.toString() as string)
})
</script>
