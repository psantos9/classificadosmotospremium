<template>
  <div class="card max-w-screen-md mx-auto">
    <div class="card-header">
      Cadastro de Anunciante
    </div>
    <div class="card-section !gap-12">
      <div class="flex flex-col gap-4">
        <span class="title">Tipo de cadastro</span>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-10 sm:space-y-0">
          <div v-for="option in tipoEntidades" :key="option.id" class="flex items-center">
            <input
              :id="option.id"
              type="radio"
              :checked="registro.tipoEntidade === option.id"
              class="cursor-pointer relative size-6 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1.5 before:rounded-full before:bg-white checked:border-[var(--primary)] checked:bg-[var(--primary)] disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
              @click="registro.tipoEntidade = option.id"
            >
            <label :for="option.id" class="ml-3 block text-sm/6 font-medium text-gray-900">{{ option.title }}</label>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <span class="title">Seus dados</span>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label for="name" class="block text-sm/6 font-medium">Nome</label>
            <div class="mt-2">
              <input id="name" v-model="registro.nome" type="text" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="cpfCnpj" class="block text-sm/6 font-medium">{{ registro.tipoEntidade === EntityType.PF ? 'CPF' : 'CNPJ' }}</label>
            <div class="mt-2">
              <input id="cpfCnpj" v-model="registro.cpfCnpj" type="text" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="email" class="block text-sm/6 font-medium">E-mail</label>
            <div class="mt-2">
              <input id="email" v-model="registro.email" type="email" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="mobile" class="block text-sm/6 font-medium">Telefone Celular</label>
            <div class="mt-2">
              <input
                id="mobile"
                v-model="registro.celular"
                type="tel"
                pattern="[0-9]{11}"
                maxlength="15"
                class="form-input"
                autocomplete="off"
              >
            </div>
          </div>

          <template v-if="registro.tipoEntidade === EntityType.PF">
            <div class="sm:col-span-3">
              <label for="data_nascimento" class="block text-sm/6 font-medium">Data de Nascimento</label>
              <div class="mt-2">
                <input id="data_nascimento" v-model="registro.dataNascimento" type="text" autocomplete="off" maxlength="10" class="form-input">
              </div>
            </div>
            <div class="sm:col-span-3" />
          </template>
          <div v-else class="sm:col-span-6">
            <label for="nome_fantasia" class="block text-sm/6 font-medium">Nome Fantasia</label>
            <div class="mt-2">
              <input id="nome_fantasia" v-model="registro.nomeFantasia" type="text" autocomplete="off" maxlength="10" class="form-input">
            </div>
          </div>
          <div class="sm:col-span-3">
            <label for="password" class="block text-sm/6 font-medium">Senha</label>
            <div class="mt-2">
              <input id="password" v-model="registro.password" type="password" class="form-input">
            </div>
          </div>
          <div class="sm:col-span-3">
            <label for="password" class="block text-sm/6 font-medium">Confirmar Senha</label>
            <div class="mt-2">
              <input id="password" v-model="confirmPassword" type="password" autocomplete="off" class="form-input">
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <span class="title">Endereço</span>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div class="sm:col-span-1">
            <label for="cep" class="block text-sm/6 font-medium">CEP</label>
            <div class="mt-2">
              <input id="cep" v-model="registro.endereco.cep" type="text" autocomplete="off" class="form-input" maxlength="9">
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="logradouro" class="block text-sm/6 font-medium">Logradouro</label>
            <div class="mt-2">
              <input id="logradouro" v-model="registro.endereco.logradouro" type="text" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-1">
            <label for="numero" class="block text-sm/6 font-medium">Número</label>
            <div class="mt-2">
              <input id="numero" v-model="registro.endereco.numero" type="email" autocomplete="off" class="form-input">
            </div>
          </div>
          <div class="sm:col-span-2">
            <label for="complemento" class="block text-sm/6 font-medium">Complemento</label>
            <div class="mt-2">
              <input id="complemento" v-model="registro.endereco.complemento" type="text" autocomplete="off" class="form-input">
            </div>
          </div>
          <div class="sm:col-span-2">
            <label for="bairro" class="block text-sm/6 font-medium">Bairro</label>
            <div class="mt-2">
              <input id="bairro" v-model="registro.endereco.bairro" type="text" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-1">
            <label for="cidade" class="block text-sm/6 font-medium">Cidade</label>
            <div class="mt-2">
              <input id="cidade" v-model="registro.endereco.cidade" type="text" autocomplete="off" class="form-input">
            </div>
          </div>

          <div class="sm:col-span-1">
            <label for="estado" class="block text-sm/6 font-medium">Estado</label>
            <div class="mt-2">
              <input id="estado" v-model="registro.endereco.estado" type="text" autocomplete="off" class="form-input">
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 md:mt-8 flex justify-end">
        <button type="button" class="w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm">
          Enviar
          <FontAwesomeIcon :icon="faArrowRight" size="lg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { reactive, ref } from 'vue'

enum EntityType {
  PF = 'pf',
  PJ = 'pj'
}

interface IEntityType {
  id: EntityType
  title: string
}

export interface IAddress {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export interface IUserRegistration {
  tipoEntidade: EntityType
  nome: string
  cpfCnpj: string
  email: string
  celular: string
  dataNascimento: string
  nomeFantasia: string
  password: string
  endereco: IAddress
}

const getDefaultAddress = (): IAddress => ({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' })
const getDefaultRegistry = (): IUserRegistration => ({ tipoEntidade: EntityType.PF, nome: '', cpfCnpj: '', email: '', celular: '', dataNascimento: '', nomeFantasia: '', password: '', endereco: getDefaultAddress() })

const tipoEntidades: IEntityType[] = [
  { id: EntityType.PF, title: 'Pessoa Física' },
  { id: EntityType.PJ, title: 'Pessoa Jurídica' }
]
const confirmPassword = ref('')
const registro = ref<IUserRegistration>(getDefaultRegistry())
</script>
