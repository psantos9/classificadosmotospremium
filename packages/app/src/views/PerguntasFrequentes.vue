<template>
  <div class="view-container flex-1 flex flex-col">
    <div class="card flex-1 md:flex-0">
      <div class="p-4 md:p-8 flex items-center justify-center uppercase font-black text-2xl">
        Perguntas Frequentes
      </div>
      <div class="flex-1 flex flex-col items-center p-4 md:p-8">
        <div class="max-w-screen-sm flex flex-col">
          <Disclosure v-for="(item, i) in faq" :key="i" v-slot="{ open }">
            <DisclosureButton
              class="mt-4 flex w-full items-center justify-between bg-[var(--primary-lightest)] px-4 py-2 text-left text-base font-semibold text-[var(--primary-text)] hover:bg-[var(--primary-lighter)] focus:outline-none transition-colors"
              :class="[open ? '!rounded-t-md' : 'rounded-md']"
            >
              <span>{{ item.Q }}</span>
              <FontAwesomeIcon :icon="faChevronDown" class="transition-all" :class="[open ? '' : 'rotate-180']" />
            </DisclosureButton>
            <DisclosurePanel class="px-4 py-2 text-sm bg-white rounded-b-md border whitespace-break-spaces">
              {{ item.A }}
            </DisclosurePanel>
          </Disclosure>
        </div>
        <p class="mt-8 hidden md:block">
          <img src="@/assets/images/full_logo.svg" class="max-w-[200px] md:max-w-screen-xs">
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const faq = [
  {
    Q: '⁠O CMP pode recusar meu anúncio?',
    A: 'Sim, caso não cumpra com nossas regras, seja suspeito de fraude, possua venda de produto proibido ou ilegal, preços enganosos, trote e outros similares, poderemos excluir o anúncio.'
  },
  {
    Q: 'O CPM poderá mediar negociações ?',
    A: 'Não! Nós reservamos apenas ao direito de conectar vendedores a compradores.'
  },
  {
    Q: 'Que tipos de anúncios não são permitidos?',
    A: 'Não serão aceitos anúncios contendo veículos fruto de furto ou roubo, sem documentação, com busca de apreensão, que não possam ser transferidos ou até mesmo que necessitem de transferências duplas. O veículo anunciado deverá estar em nome do vendedor ou de um procurador.'
  },
  {
    Q: 'Como denunciar um anúncio?',
    A: 'Caso haja suspeita de fraude ou uso irregular da plataforma, a denúncia poderá ser feita através da nossa Página de contato.'
  },
  {
    Q: 'Como desativar um anúncio?',
    A: 'Para desativar um anúncio acesse Minha conta, clique no anúncio desejado e selecione a opção de excluir.'
  },
  {
    Q: 'O que é uma moto premium? Posso anunciar qualquer moto?',
    A: `Nosso classificados é segmentado para motos premium, ou seja, motos que se destacam por sua qualidade, design, inovação e desempenho. Além disso, pode ser um meio de expressar um estilo de vida. Cada fabricante tem a sua própria definição de moto premium. No entanto, alguns fatores que podem definir uma moto premium são:
Qualidade e acabamento,
Tecnologia avançada,
Capacidade de motor,
Serviços oferecidos,
Coleção de roupas e acessórios.
O produto é mais exclusivo e apresenta alto valor agregado,
Normalmente oferece motorização acima de 450 cm³,
Possui menor escala de produção,
Tem apelo voltado para o desempenho e a alta tecnologia.`
  },
  {
    Q: 'Como devo anunciar o meu veículo?',
    A: `Todas as motos precisam ter o preço obrigatoriamente.
Descreva o máximo de detalhes possíveis, tanto itens que possam valorizar a moto como detalhes que possam desvalorizar a moto, quanto mais transparente a negociação, melhor para ambas as partes.
Faça fotos que enquadrem a moto de forma inteira, preferencialmente dos dois lados da moto, assim como dos detalhes. Utilize o formato 4:3.
Quanto mais profissional a foto for, maior a chance de vender a sua moto. Evite postar fotos utilizando o dedo para tampar a placa, utilize aplicativos de edição ou tampe a placa com algum objeto.
Tire fotos da sua moto após uma lavagem para mostrar o estado real da motocicleta.`
  },
  {
    Q: 'A plataforma envia algum código SMS ou liga para fazer confirmação de anúncios?',
    A: 'Não! Não enviamos nenhum código via SMS ou fazemos ligação. Qualquer contato será realizado somente através do nosso e-mail oficial terminado em @classificadosmotospremium.com.br.'
  }
]
</script>
