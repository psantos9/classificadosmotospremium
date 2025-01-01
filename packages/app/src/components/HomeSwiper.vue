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
  '/images/Banner_1_less.png',
  '/images/Banner_2_less.png',
  '/images/Banner_3_less.png',
  '/images/Banner_4_less.png',
  '/images/Banner_5_less.png',
  '/images/Banner_6_less.png'
]
</script>
