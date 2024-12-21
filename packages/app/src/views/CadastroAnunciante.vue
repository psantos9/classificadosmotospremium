<template>
  <div class="card max-w-screen-md mx-auto">
    <div class="card-header">
      Cadastro de Anunciante
    </div>
    <div class="card-section !gap-12">
      <div class="flex flex-col gap-4">
        <div class="title">
          <span>Seus dados </span>
          <span v-if="tipoEntidade !== null">({{ tipoEntidade === EntityType.PF ? 'Pessoa Física' : 'Pessoa Jurídica' }})</span>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label for="name" class="block text-sm/6 font-medium">{{ tipoEntidade === EntityType.PF ? 'Nome' : tipoEntidade === EntityType.PJ ? 'Razão Social' : 'Nome ou Razão Social' }}</label>
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

          <div class="sm:col-span-2">
            <label for="cpfCnpj" class="block text-sm/6 font-medium">{{ tipoEntidade === EntityType.PF ? 'CPF' : tipoEntidade === EntityType.PJ ? 'CNPJ' : 'CPF ou CNPJ' }}</label>
            <div class="mt-2 relative">
              <input
                id="cpfCnpj"
                v-model="cpfCnpj"
                v-maska="{ mask: (value) => cpf.isValid(value) ? '###.###.###-##' : cnpj.isValid(value) ? '##.###.###/####-##' : '##############' }"
                v-bind="cpfCnpjAttrs"
                type="text"
                autocomplete="off"
                class="form-input"
              >
              <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                {{ errors.cpfCnpj }}
              </p>
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

          <template v-if="tipoEntidade === EntityType.PF">
            <div class="sm:col-span-3">
              <label for="data_nascimento" class="block text-sm/6 font-medium">Data de Nascimento</label>
              <div class="mt-2 relative">
                <input
                  id="data_nascimento"
                  v-model="dataNascimento"
                  v-bind="dataNascimentoAttrs"
                  v-maska="{ mask: '####-##-##' }"
                  placeholder="AAAA-MM-DD"
                  type="text"
                  autocomplete="off"
                  class="form-input"
                >
                <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
                  {{ errors.dataNascimento }}
                </p>
              </div>
            </div>
            <div class="sm:col-span-3" />
          </template>
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
      <div class="mt-4 md:mt-8 flex justify-end">
        <button
          type="button"
          class="w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm"
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
import { CpfCnpjConflictError, EmailConflictError } from '@/composables/api-client'
import { useApp } from '@/composables/useApp'
import { type NovoCadastro, novoCadastroSchema } from '@cmp/shared/models/novo-cadastro'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { cnpj, cpf } from 'cpf-cnpj-validator'
import debounce from 'lodash.debounce'
import { vMaska } from 'maska/vue'
import { useForm } from 'vee-validate'
import { ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

enum EntityType {
  PF = 'pf',
  PJ = 'pj'
}
const $toast = useToast()
const router = useRouter()
const { api } = useApp()
const tipoEntidade = ref<EntityType | null>(null)

const validationSchema = toTypedSchema(novoCadastroSchema)
const { errors, defineField, values, setFieldError, validate } = useForm({ validationSchema })
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
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const submit = async () => {
  const { valid } = await validate()
  if (valid) {
    const cadastro = JSON.parse(JSON.stringify(unref(values))) as NovoCadastro
    try {
      await api.criaNovoCadastro(cadastro)
      router.push({ name: 'home' })
      $toast.success('Conta criada com sucesso')
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

watch(cpfCnpj, (cpfCnpj = '') => {
  if (cpf.isValid(cpfCnpj)) {
    tipoEntidade.value = EntityType.PF
  }
  else if (cnpj.isValid(cpfCnpj)) {
    tipoEntidade.value = EntityType.PJ
  }
  else {
    tipoEntidade.value = null
  }
})

watch(cep, async () => {
  await debouncedValidateCEP(unref(cep)?.toString() as string)
})
</script>
