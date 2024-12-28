<template>
  <div class="flex-1 p-4 md:my-8 md:max-w-screen-lg md:mx-auto bg-white rounded-md md:grid md:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-8">
    <div class="flex flex-col">
      <swiper-container v-bind="options" class="w-full aspect-video">
        <swiper-slide v-for="(foto, i) in fotos" :key="i">
          <ExpandableImage
            :src="foto"
            class="rounded-md shadow object-fit"
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
    <div v-if="anuncio" class="flex flex-col gap-4">
      <div class="uppercase font-light text-xs text-gray-500">
        Código: {{ anuncio.id }}
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
      <div class="py-8 grid md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
        <div v-for="(caracteristica, i) in caracteristicas" :key="i" class="flex items-center gap-4">
          <FontAwesomeIcon :icon="caracteristica.icon" class="text-[var(--primary)]" size="2x" />
          <div class="flex flex-col">
            <div class="text-sm font-light">
              {{ caracteristica.label }}
            </div>
            <div class="text-sm font-bold">
              {{ caracteristica.value }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 text-sm">
        <div class="font-bold ">
          Mais sobre a moto
        </div>
        <div>{{ anuncio.descricao || 'Sem descrição' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/schema'
import type { SwiperOptions } from 'swiper/types'
import ExpandableImage from '@/components/ExpandableImage.vue'
import { useApp } from '@/composables/useApp'
import { faCalendarAlt, faPalette, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
  const { marca, modelo, ano, anoModelo, quilometragem, cor } = anuncio
  const caracteristicas: ICaracteristica[] = [
    { icon: faCalendarAlt, label: 'Ano', value: `${ano}/${anoModelo}` },
    { icon: faTachometerAlt, label: 'KM', value: quilometragem.toString() },
    { icon: faPalette, label: 'Cor', value: cor.toString() }
  ]
  return caracteristicas
}

register()

const router = useRouter()
const { api } = useApp()

const adId = Number.parseInt(unref(router.currentRoute).params.id as string ?? '')

if (Number.isNaN(adId)) {
  router.push({ name: 'veiculos' })
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
