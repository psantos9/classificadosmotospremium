<template>
  <div class="view-container flex-1 flex flex-col">
    <div class="card shadow-none flex-1 md:flex-initial md:shadow">
      <div class="p-4 md:p-8 flex items-center justify-center uppercase font-black text-2xl">
        Fale Conosco
      </div>
      <div class="card-section">
        <span class="title">Opções de Ajuda</span>
        <span>Não fique com nenhuma dúvida. Escolha a sua forma preferida para entrar em contato conosco.</span>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(section, i) in sections" :key="i" class="bg-white rounded-md shadow p-4 flex flex-col gap-2 cursor-pointer hover:bg-[var(--primary)] transition-colors" @click="section.action">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faArrowRight, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const sections = [
  { icon: faWhatsapp, title: 'Whatsapp', description: 'Clique aqui para iniciar uma conversa agora', action: () => window.open('https://wa.me/5562998590500', '_blank') },
  { icon: faEnvelope, title: 'E-mail', description: 'Envie um email contato@classificadosmotospremium.com.br', action: () => window.open('mailto:contato@classificadosmotospremium.com.br', '_blank') },
  { icon: faPhone, title: 'Telefone', description: 'Ligue para o numero (62) 99859-0500', action: () => window.open('tel:62998590500', '_blank') }
]
</script>
