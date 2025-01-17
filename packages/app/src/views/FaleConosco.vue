<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        Fale Conosco
      </div>
      <div class="card-section">
        <span class="title">Opções de Ajuda</span>
        <span>Não fique com nenhuma dúvida. Escolha a sua forma preferida para entrar em contato conosco.</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div class="card-section">
        <span class="title">Formulário de contato</span>
        <span>Caso não tenha solucionado sua dúvida nas Perguntas Frequentes, você também pode preencher o nosso formulário de contato abaixo e um dos nossos atendentes responderá o mais breve possível.</span>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Nome</label>
            <div class="mt-2">
              <input id="name" type="text" name="first-name" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base  outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="email" class="block text-sm/6 font-medium">E-mail</label>
            <div class="mt-2">
              <input id="email" type="text" name="last-name" autocomplete="family-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="phone" class="block text-sm/6 font-medium">Telefone</label>
            <div class="mt-2">
              <input id="phone" name="phone" type="email" autocomplete="phone" class="block w-full rounded-md bg-white px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="subject" class="block text-sm/6 font-medium">Assunto</label>
            <div class="mt-2 grid grid-cols-1">
              <select id="subject" name="subject" autocomplete="subject" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
                <option>Anúncio para lojistas</option>
                <option>Denúncia</option>
                <option>Dúvida</option>
                <option>Reclamação</option>
              </select>
              <FontAwesomeIcon :icon="faChevronDown" size="xl" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
            </div>
          </div>
          <div class="col-span-full">
            <label for="message" class="block text-sm/6 font-medium">Mensagem</label>
            <div class="mt-2">
              <textarea id="message" name="message" rows="3" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6" placeholder="Digite sua dúvida ou solicitação" />
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
  </div>
</template>

<script lang="ts" setup>
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faArrowRight, faChevronDown, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const sections = [
  { icon: faWhatsapp, title: 'Whatsapp', description: 'Clique aqui para iniciar uma conversa agora', action: () => window.open('https://wa.me/5562998590500', '_blank') },
  { icon: faEnvelope, title: 'E-mail', description: 'Envie um email suporte@classificadosmotospremium.com.br', action: () => window.open('mailto:suporte@classificadosmotospremium.com.br', '_blank') },
  { icon: faPhone, title: 'Telefone', description: 'Ligue para o numero (62) 99859-0500', action: () => window.open('tel:62998590500', '_blank') }
]
</script>
