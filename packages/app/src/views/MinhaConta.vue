<template>
  <div class="view-container flex-1 flex flex-col items-center">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      <div
        v-for="(section, i) in sections"
        :key="i"
        class="bg-white rounded-md shadow p-4 flex flex-col gap-2 cursor-pointer hover:bg-[var(--primary)] transition-colors"
        @click="section.action"
      >
        <div class="mb-2">
          <FontAwesomeIcon :icon="section.icon" size="xl" />
        </div>
        <div class="font-bold uppercase">
          {{ section.title }}
        </div>
        <div class="font-extralight text-sm">
          {{ section.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { faBullhorn, faEnvelope, faLock, faSignOut, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter } from 'vue-router'

const { api } = useApp()
const router = useRouter()

const sections = [
  { icon: faBullhorn, title: 'Meus Anúncios', description: 'Gerencie seus anúncios ativos e inativos', action: async () => await router.push({ name: 'meus-anuncios' }) },
  { icon: faEnvelope, title: 'Minhas Conversas', description: 'Leia e gerencie as mensagens que você recebeu', action: async () => await router.push({ name: 'minhas-conversas' }) },
  { icon: faUser, title: 'Meus Dados', description: 'Atualize seus dados cadastrais', action: async () => await router.push({ name: 'meus-dados' }) },
  { icon: faLock, title: 'Alterar Senha', description: 'Atualize a sua senha com frequência para garantir a segurança da sua conta', action: async () => await router.push({ name: 'alterar-senha' }) },
  { icon: faSignOut, title: 'Sair', description: 'Encerre a sessão da sua conta com segurança', action: async () => await api.logout() }
]
</script>
