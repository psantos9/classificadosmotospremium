<template>
  <div class="flex-1 p-4 md:my-8 md:max-w-screen-lg md:mx-auto bg-white rounded-md flex flex-col md:grid md:grid-cols-2 gap-4 w-full">
    <div v-if="!anuncio" role="status" class="w-full flex items-center justify-center bg-gray-300 rounded-md animate-pulse aspect-[4/3]">
      <FontAwesomeIcon :icon="faImage" class="text-gray-200" size="3x" />
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else class="flex flex-col">
      <swiper-container v-bind="{ slidesPerView: 1, spaceBetween: 10, navigation: true }" class="w-full md:hidden">
        <swiper-slide v-for="(foto, i) in anuncio.fotos" :key="i">
          <ExpandableImage
            :image-id="foto"
            container-class="rounded-md bg-black aspect-[4/3] mx-auto w-full"
          />
        </swiper-slide>
      </swiper-container>

      <swiper-container v-bind="options" class="w-full hidden md:block">
        <swiper-slide v-for="(foto, i) in anuncio.fotos" :key="i">
          <ExpandableImage
            :image-id="foto"
            container-class="rounded-md bg-black aspect-[4/3] mx-auto w-full"
          />
        </swiper-slide>
      </swiper-container>

      <swiper-container
        class="thumbs-swiper w-full hidden md:block"
        v-bind="optionsThumbs"
        style="--swiper-navigation-color: #fff; --swiper-pagination-color: #fff"
      >
        <swiper-slide v-for="(imageId, j) in anuncio.fotos" :key="j">
          <img :src="api.getImageUrl({ imageId, thumbnail: true })" class="cursor-pointer rounded-md object-fit">
        </swiper-slide>
      </swiper-container>
    </div>

    <div class="flex flex-col gap-2 md:p-2">
      <div class="flex items-center justify-between">
        <div class="uppercase font-light text-xs text-gray-500 flex items-center gap-1">
          <span>Código:</span>
          <span v-if="anuncio">{{ anuncio.id }}</span>
          <span v-else class="bg-gray-200 rounded-md w-48 animate-pulse">&nbsp;</span>
        </div>
        <button
          v-if="signedIn && anuncio?.sellerId === api.userId "
          type="button"
          class="px-3 py-2 text-xs font-medium text-center inline-flex items-center gap-2 text-[var(--info-text)] bg-[var(--info)] rounded-md hover:bg-[var(--info-darker)] focus:outline-none transition-colors"
          @click="$router.push({ name: 'anuncie', params: { adId } })"
        >
          <FontAwesomeIcon :icon="faEdit" />
          Editar
        </button>
      </div>

      <div class="text-4xl font-black flex items-center">
        <span v-if="anuncio">{{ anuncio.marca }}</span>
        <span v-else class="bg-gray-200 rounded-md w-48 animate-pulse">&nbsp;</span>
      </div>
      <div class="text-2xl flex items-center">
        <span v-if="anuncio"> {{ anuncio.modelo }}</span>
        <span v-else class="bg-gray-200 rounded-md w-48 animate-pulse">&nbsp;</span>
      </div>
      <div class="text-4xl font-black text-[var(--success)] flex">
        <span v-if="anuncio">
          {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.preco) }}
        </span>
        <span v-else class="bg-gray-200 rounded-md w-48 animate-pulse">&nbsp;</span>
      </div>
      <div class="flex items-center gap-2" :class="[anuncio?.aceitaTroca ? 'text-gray-400' : 'text-[var(--danger)]']">
        <FontAwesomeIcon :icon="anuncio?.aceitaTroca ? faInfoCircle : faExclamationTriangle" />
        <span class="uppercase text-xs italic">
          {{ anuncio?.aceitaTroca ? 'Aceita' : 'Não aceita' }} propostas de troca
        </span>
      </div>
      <div class="uppercase font-semibold text-[var(--info)] flex gap-2 items-center">
        <FontAwesomeIcon :icon="faLocationDot" />
        <span v-if="anuncio">
          {{ anuncio.localidade }} / {{ anuncio.uf }}
        </span>
        <span v-else class="bg-gray-200 rounded-md w-48 animate-pulse">&nbsp;</span>
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
        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Informações adicionais
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <template v-if="anuncio">
              <div v-for="(informacaoAdicional, i) in anuncio.informacoesAdicionais" :key="i" class="flex gap-2 items-center text-[var(--primary)]">
                <FontAwesomeIcon :icon="faInfoCircle" />
                <div class="text-sm">
                  {{ informacaoAdicional }}
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="id in [...Array(5).keys()]" :key="id" class="flex border px-1 rounded-md text-xs font-light bg-gray-200 shadow animate-pulse">
                <span class="w-24">&nbsp;</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-2 text-sm">
          <div class="font-semibold text-sm">
            Acessórios
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <template v-if="anuncio">
              <div v-for="(acessorio, i) in anuncio.acessorios" :key="i" class="flex gap-2 items-center text-[var(--info)]">
                <FontAwesomeIcon :icon="faPlusCircle" />
                <div class="text-sm">
                  {{ acessorio }}
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="id in [...Array(5).keys()]" :key="id" class="flex border px-1 rounded-md text-xs font-light bg-gray-200 shadow animate-pulse">
                <span class="w-24">&nbsp;</span>
              </div>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Mais sobre a moto
          </div>
          <div class="font-light text-xs flex">
            <span v-if="anuncio">
              {{ anuncio.descricao || 'Sem descrição' }}
            </span>
            <span v-else class="bg-gray-200 rounded-md w-full h-16 animate-pulse">&nbsp;</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-md shadow border bg-gray-100 p-4 flex flex-col gap-4 self-start w-full">
      <div class="text-lg font-black">
        Sobre o anunciante
      </div>
      <div class="flex gap-4 item-center">
        <div class="bg-black rounded-md shadow aspect-square flex items-center justify-center">
          <img src="@/assets/images/logo_dark.svg" class="h-24 mx-auto">
        </div>
        <div v-if="anuncio?.seller" class="flex flex-col justify-between gap-1 text-sm">
          <span class="font-black text-base">
            {{ anuncio.seller.nomeFantasia ?? 'Particular' }}
          </span>
          <span class="flex items-center gap-2">
            <FontAwesomeIcon :icon="faLocationDot" />
            <span class="font-thin">{{ anuncio.seller.localidade }} - {{ anuncio.seller.uf }}</span>
          </span>
          <span v-if="anuncio.celular" class="flex items-center gap-2">
            <FontAwesomeIcon :icon="faPhone" />
            <span class="font-thin">{{ anuncio.celular }}</span>
          </span>

          <span class="font-thin text-xs">No site desde {{ format(anuncio.seller.createdAt, 'dd \'de\' MMMM yyyy', { locale: ptBR }) }}</span>
        </div>
      </div>
    </div>

    <AdMessage v-if="anuncio" :anuncio="anuncio" />
    <div v-else class="w-full flex items-center justify-center bg-gray-300 rounded-md animate-pulse" />
  </div>
</template>

<script lang="ts" setup>
import type { TAdDocument } from '@cmp/shared/models/typesense'
import type { SwiperOptions } from 'swiper/types'
import AdMessage from '@/components/AdMessage.vue'
import ExpandableImage from '@/components/ExpandableImage.vue'
import { useApp } from '@/composables/useApp'
import { useMixpanel } from '@/composables/useMixpanel'
import { faCalendarAlt, faEdit, faExclamationTriangle, faImage, faInfoCircle, faLocationDot, faPalette, faPhone, faPlusCircle, faSpinner, faTachometerAlt, faWarning } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { format } from 'date-fns'

import { ptBR } from 'date-fns/locale/pt-BR'
import { register } from 'swiper/element/bundle'
import { type Component, ref, unref } from 'vue'
import { useRouter } from 'vue-router'

export interface ICaracteristica {
  icon: Component
  label: string
  value: string
}

const getCaracteristicas = (anuncio: TAdDocument | null): ICaracteristica[] => {
  if (anuncio === null) {
    return []
  }
  const { ano, anoModelo, quilometragem, cor } = anuncio
  const caracteristicas: ICaracteristica[] = [
    { icon: faCalendarAlt, label: 'Ano', value: `${ano}/${anoModelo}` },
    { icon: faTachometerAlt, label: 'Quilometragem', value: `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(quilometragem)} km` },
    { icon: faPalette, label: 'Cor', value: cor }
  ]
  return caracteristicas
}

register()

const { trackOpenAd } = useMixpanel()
const router = useRouter()
const { api, signedIn } = useApp()

const adId = Number.parseInt(unref(router.currentRoute).params.id as string ?? '')

if (Number.isNaN(adId)) {
  router.push({ name: 'anuncios' })
}

const loading = ref(false)
const anuncio = ref<TAdDocument | null>(null)
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
  try {
    loading.value = true
    const _anuncio = await api.fetchAnuncio(adId)
    anuncio.value = _anuncio
    caracteristicas.value = getCaracteristicas(unref(anuncio))
    trackOpenAd(_anuncio)
  }
  finally {
    loading.value = false
  }
}

fetchAnuncio()
</script>

<style lang="sass" scoped>
swiper-container.thumbs-swiper
  @apply py-2
</style>
