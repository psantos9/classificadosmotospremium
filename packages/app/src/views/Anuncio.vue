<template>
  <div class="flex-1 p-4 md:my-8 md:max-w-screen-lg md:mx-auto bg-white rounded-md md:grid md:grid-cols-2 gap-4">
    <div class="flex flex-col">
      <swiper-container v-bind="options" class="w-full">
        <swiper-slide v-for="(foto, i) in fotos" :key="i">
          <ExpandableImage
            :src="foto"
            container-class="rounded-md bg-black aspect-video mx-auto"
            class="h-full mx-auto rounded-md shadow-md"
          />
        </swiper-slide>
      </swiper-container>

      <swiper-container
        class="thumbs-swiper w-full"
        v-bind="optionsThumbs"
        style="--swiper-navigation-color: #fff; --swiper-pagination-color: #fff"
      >
        <swiper-slide v-for="(thumbnail, j) in fotos" :key="j">
          <img :src="thumbnail" class="cursor-pointer rounded-md object-fit">
        </swiper-slide>
      </swiper-container>
    </div>
    <div v-if="anuncio" class="flex flex-col gap-2 p-4">
      <div class="flex items-center justify-between">
        <div class="uppercase font-light text-xs text-gray-500">
          Código: {{ anuncio.id }}
        </div>
        <div class="uppercase font-light text-xs text-gray-500 flex gap-2 items-center">
          <FontAwesomeIcon :icon="faLocationDot" />
          {{ anuncio.localidade }} / {{ anuncio.uf }}
        </div>
      </div>

      <div class="text-4xl font-black">
        {{ anuncio.marca }}
      </div>
      <div class="text-2xl">
        {{ anuncio.modelo }}
      </div>
      <div class="text-4xl font-black text-[var(--success)]">
        {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.preco) }}
      </div>
      <div class="py-8 flex justify-between md:grid md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
        <div v-for="(caracteristica, i) in caracteristicas" :key="i" class="flex items-center gap-4">
          <FontAwesomeIcon :icon="caracteristica.icon" class="text-[var(--primary)]" size="2x" />
          <div class="flex flex-col">
            <div class="text-sm font-light">
              {{ caracteristica.label }}
            </div>
            <div class="text-sm font-semibold">
              {{ caracteristica.value }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2 text-sm">
          <div class="font-semibold text-sm">
            Acessórios
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="id in anuncio.acessorios" :key="id" class="border px-1 rounded-md text-xs font-light bg-green-100 border-green-200 shadow">
              {{ acessorios.find(acessorio => acessorio.id === id)?.label }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Informações adicionais
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="id in anuncio.informacoesAdicionais" :key="id" class="border px-1 rounded-md text-xs font-light bg-yellow-100 border-yellow-200 shadow">
              {{ informacoesAdicionais.find(informacaoAdicional => informacaoAdicional.id === id)?.label }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Mais sobre a moto
          </div>
          <div class="font-light text-xs">
            {{ anuncio.descricao || 'Sem descrição' }}
          </div>
        </div>
      </div>
    </div>
    <div class="rounded-md shadow border bg-gray-100 p-4 flex flex-col gap-4">
      <div class="text-lg font-black">
        Sobre o anunciante
      </div>
      <div class="flex gap-4 item-center">
        <div class="bg-black rounded-md shadow aspect-square flex items-center justify-center">
          <img src="@/assets/images/logo_dark.svg" class="h-24 mx-auto">
        </div>
        <div class="flex flex-col justify-between gap-3">
          <span class="font-black text-base">{{ anuncio?.usuario.nomeFantasia ?? 'Particular' }}</span>
          <span class="flex items-center gap-2">
            <FontAwesomeIcon :icon="faLocationDot" />
            <span class="font-thin">{{ anuncio?.usuario.localidade }} - {{ anuncio?.usuario.uf }}</span>
          </span>
          <span class="font-thin text-xs">No site desde {{ format(parseISO(anuncio?.usuario.createdAt ?? ''), 'MMMM \'de\' yyyy', { locale: ptBR }) }}</span>
          <!--
          <button
            type="button"
            class="flex items-center gap-1 text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
          >
            <FontAwesomeIcon :icon="faPhone" />
            Ver telefone
          </button>
          -->
        </div>
      </div>
    </div>
    <div class="rounded-md shadow border p-4 flex flex-col gap-4 bg-gray-100">
      <div class="text-lg font-black">
        Enviar proposta
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div class="col-span-full">
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label>
          <input id="name" class="form-input">
        </div>
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefone</label>
          <input id="name" class="form-input">
        </div>
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
          <input id="name" class="form-input">
        </div>
        <div class="col-span-full">
          <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mensagem</label>
          <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :placeholder="`Gostei do seu anúncio da ${anuncio?.marca} ${anuncio?.modelo} e gostaria de mais informações.`" />
        </div>
      </div>
      <div class="mt-4 flex justify-center items-center">
        <button
          type="button"
          class="flex items-center justify-center gap-1 text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
        >
          Enviar mensagem
          <FontAwesomeIcon :icon="faChevronRight" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/models'
import type { SwiperOptions } from 'swiper/types'
import ExpandableImage from '@/components/ExpandableImage.vue'
import { useApp } from '@/composables/useApp'
import { faCalendarAlt, faChevronRight, faLocationDot, faPalette, faPhone, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { register } from 'swiper/element/bundle'
import { type Component, ref, unref } from 'vue'
import { useRouter } from 'vue-router'

export interface ICaracteristica {
  icon: Component
  label: string
  value: string
}

const getCaracteristicas = (anuncio: PublicAd | null): ICaracteristica[] => {
  if (anuncio === null) {
    return []
  }
  const { ano, anoModelo, quilometragem, cor } = anuncio
  const caracteristicas: ICaracteristica[] = [
    { icon: faCalendarAlt, label: 'Ano', value: `${ano}/${anoModelo}` },
    { icon: faTachometerAlt, label: 'Quilometragem', value: `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(quilometragem)} km` },
    { icon: faPalette, label: 'Cor', value: cor.label.toString() }
  ]
  return caracteristicas
}

register()

const router = useRouter()
const { api, informacoesAdicionais, acessorios } = useApp()

const adId = Number.parseInt(unref(router.currentRoute).params.id as string ?? '')

if (Number.isNaN(adId)) {
  router.push({ name: 'anuncios' })
}

const fotos = ref<string[]>([])
const anuncio = ref<PublicAd | null>(null)
const caracteristicas = ref<ICaracteristica[]>([])

const options: SwiperOptions = {
  thumbs: {
    swiper: '.thumbs-swiper'
  },
  navigation: true,
  spaceBetween: 10
}

const optionsThumbs: SwiperOptions = {
  slidesPerView: 4,
  spaceBetween: 10
}

const fetchAnuncio = async () => {
  anuncio.value = await api.fetchAnuncio(adId)
  fotos.value = (unref(anuncio)?.fotos ?? []).map(foto => api.getImageUrl(foto))
  caracteristicas.value = getCaracteristicas(unref(anuncio))
}

fetchAnuncio()
</script>

<style lang="sass" scoped>
swiper-container.thumbs-swiper
  @apply py-2
</style>
