<template>
  <swiper-container v-bind="options">
    <swiper-slide v-for="(slide, i) in slides" :key="i">
      <img :src="slide">
    </swiper-slide>
  </swiper-container>
</template>

<script lang="ts" setup>
import type { SwiperOptions } from 'swiper/types'
import { register } from 'swiper/element/bundle'

register()

const options: SwiperOptions = {
  slidesPerView: 1,
  centeredSlides: true,
  pagination: { enabled: false },
  effect: 'fade',
  speed: 1000,
  autoplay: { delay: 5000 }

}

const slides = [
  'https://cdn.novaoitoclassificados.app/images/2/324663645649c88af0f61a5.71426777.1687980207.png',
  'https://cdn.novaoitoclassificados.app/images/2/121992113060c139a72ed2a9.87136153.1623275943.png'
]
</script>
