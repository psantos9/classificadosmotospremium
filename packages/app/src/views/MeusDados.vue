<template>
  <div class="view-container">
    <div class="card max-w-screen-md mx-auto">
      <div class="card-header">
        Meus Dados
      </div>
      <div class="card-section !gap-12">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="name" class="block text-sm/6 font-medium">{{ cpf.isValid(cpfCnpj ?? '') ? 'Nome' : 'Razão Social' }}</label>
              <div class="mt-2 relative">
                <input
                  id="name"
                  v-model="nomeRazaoSocial"
                  v-bind="nomeRazaoSocialAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.nomeRazaoSocial }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="cpfCnpj" class="block text-sm/6 font-medium">{{ cpf.isValid(cpfCnpj ?? '') ? 'CPF' : 'CNPJ' }}</label>
              <div class="mt-2 relative">
                <input
                  id="cpfCnpj"
                  v-model="cpfCnpj"
                  v-maska="{ mask: (value) => cpf.isValid(value) ? '###.###.###-##' : cnpj.isValid(value) ? '##.###.###/####-##' : '##############' }"
                  v-bind="cpfCnpjAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input bg-gray-100"
                  disabled
                >
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="email" class="block text-sm/6 font-medium">E-mail</label>
              <div class="mt-2 relative">
                <input
                  id="email"
                  v-model="email"
                  v-bind="emailAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.email }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="mobile" class="block text-sm/6 font-medium">Telefone Celular</label>
              <div class="mt-2 relative">
                <input
                  id="mobile"
                  v-model="celular"
                  v-maska="{ mask: '(##) #########' }"
                  v-bind="celularAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.celular }}
                </p>
              </div>
            </div>
            <div v-if="tipoEntidade === EntityType.PJ" class="sm:col-span-6">
              <label for="nome_fantasia" class="block text-sm/6 font-medium">Nome Fantasia</label>
              <div class="mt-2 relative">
                <input
                  id="nome_fantasia"
                  v-model="nomeFantasia"
                  v-bind="nomeFantasiaAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.nomeFantasia }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <span class="title">Endereço</span>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div class="sm:col-span-1">
              <label for="cep" class="block text-sm/6 font-medium">CEP</label>
              <div class="mt-2 relative">
                <input
                  id="cep"
                  v-model="cep"
                  v-bind="cepAttrs"
                  v-maska="{ mask: '#####-###' }"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                ><p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.cep }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="logradouro" class="block text-sm/6 font-medium">Logradouro</label>
              <div class="mt-2 relative">
                <input
                  id="logradouro"
                  v-model="logradouro"
                  v-bind="logradouroAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.logradouro }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-1">
              <label for="numero" class="block text-sm/6 font-medium">Número</label>
              <div class="mt-2 relative">
                <input
                  id="numero"
                  v-model="numero"
                  v-bind="numeroAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.numero }}
                </p>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="complemento" class="block text-sm/6 font-medium">Complemento</label>
              <div class="mt-2 relative">
                <input
                  id="complemento"
                  v-model="complemento"
                  v-bind="complementoAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.complemento }}
                </p>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="bairro" class="block text-sm/6 font-medium">Bairro</label>
              <div class="mt-2 relative">
                <input
                  id="bairro"
                  v-model="bairro"
                  v-bind="bairroAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.bairro }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-1">
              <label for="localidade" class="block text-sm/6 font-medium">Localidade</label>
              <div class="mt-2 relative">
                <input
                  id="localidade"
                  v-model="localidade"
                  v-bind="localidadeAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.localidade }}
                </p>
              </div>
            </div>

            <div class="sm:col-span-1">
              <label for="ud" class="block text-sm/6 font-medium">UF</label>
              <div class="mt-2 relative">
                <input
                  id="uf"
                  v-model="uf"
                  v-bind="ufAttrs"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.uf }}
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
            <FontAwesomeIcon :icon="submitting ? faSpinner : faArrowRight" size="lg" :spin="submitting" fixed-width />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Usuario } from '@cmp/shared/models/database/models'
import { CpfCnpjConflictError, EmailConflictError } from '@/composables/api-client'
import { useApp } from '@/composables/useApp'
import { atualizaUsuarioSchema } from '@cmp/shared/models/atualiza-usuario'
import { faArrowLeft, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { cnpj, cpf } from 'cpf-cnpj-validator'
import { sha256 } from 'js-sha256'
import debounce from 'lodash.debounce'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

enum EntityType {
  PF = 'pf',
  PJ = 'pj'
}
const $toast = useToast()
const { api } = useApp()
const router = useRouter()

const userId = ref<number | null>(null)
const originalHash = ref('')
const skipCepCheck = ref(true)
const submitting = ref(false)

const validationSchema = toTypedSchema(atualizaUsuarioSchema)
const { errors, defineField, values, setFieldError, validate, setFieldValue, meta } = useForm({ validationSchema })
const [cpfCnpj, cpfCnpjAttrs] = defineField('cpfCnpj')
const [nomeRazaoSocial, nomeRazaoSocialAttrs] = defineField('nomeRazaoSocial')
const [nomeFantasia, nomeFantasiaAttrs] = defineField('nomeFantasia')
const [email, emailAttrs] = defineField('email')
const [celular, celularAttrs] = defineField('celular')
const [cep, cepAttrs] = defineField('cep')
const [logradouro, logradouroAttrs] = defineField('logradouro')
const [complemento, complementoAttrs] = defineField('complemento')
const [numero, numeroAttrs] = defineField('numero')
const [bairro, bairroAttrs] = defineField('bairro')
const [localidade, localidadeAttrs] = defineField('localidade')
const [uf, ufAttrs] = defineField('uf')

const syncUsuario = async (_usuario?: Omit<Usuario, 'password'>) => {
  if (!_usuario) {
    try {
      submitting.value = true
      _usuario = await api.fetchUsuario()
    }
    finally {
      submitting.value = false
    }
  }
  const { id, cpfCnpj, nomeRazaoSocial, nomeFantasia, email, celular, cep, logradouro, numero, complemento, bairro, localidade, uf } = _usuario
  userId.value = id
  setFieldValue('nomeRazaoSocial', nomeRazaoSocial)
  setFieldValue('nomeFantasia', nomeFantasia ?? '')
  setFieldValue('cpfCnpj', cpfCnpj)
  setFieldValue('email', email)
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
  setTimeout(() => {
    skipCepCheck.value = false
  }, 1000)
}

const hasChanges = computed(() => unref(originalHash) !== sha256(JSON.stringify(unref(values))))
const tipoEntidade = computed(() => {
  const isCpf = cpf.isValid(unref(cpfCnpj) ?? '')
  const isCnpj = cnpj.isValid(unref(cpfCnpj) ?? '')
  return isCpf ? EntityType.PF : isCnpj ? EntityType.PJ : null
})

const submit = async () => {
  const id = unref(userId)
  if (!id) {
    return
  }
  const { valid } = await validate()
  if (valid) {
    const usuario = JSON.parse(JSON.stringify(unref(values)))
    try {
      submitting.value = true
      const usuarioAtualizado = await api.atualizaUsuario({ id, usuario })
      await syncUsuario(usuarioAtualizado)
      $toast.success('Dados atualizados com sucesso')
      router.push({ name: 'minha-conta' })
    }
    catch (err) {
      if (err instanceof CpfCnpjConflictError) {
        setFieldError('cpfCnpj', `Já existe uma conta com este ${tipoEntidade.value === EntityType.PF ? 'CPF' : 'CNPj'}`)
      }
      else if (err instanceof EmailConflictError) {
        setFieldError('email', 'Já existe uma conta com este e-mail')
      }
      else {
        throw err
      }
    }
    finally { submitting.value = false }
  }
}

const debouncedValidateCEP = debounce(async (cep: string) => {
  if (unref(skipCepCheck)) {
    return
  }
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

syncUsuario()
</script>
