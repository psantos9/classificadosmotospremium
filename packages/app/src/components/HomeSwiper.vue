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
  '/images/banner-1.png',
  '/images/banner-2.png',
  '/images/banner-3.png',
  '/images/banner-4.png',
  '/images/banner-5.png',
  '/images/banner-6.png'
]
</script>
