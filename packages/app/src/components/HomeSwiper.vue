<template>
  <div class="bg-black">
    <div class="max-w-[1980px] mx-auto">
      <swiper-container v-bind="options">
        <swiper-slide v-for="(slide, i) in slidesDesktop" :key="i" class="hidden sm:block">
          <img :src="slide">
        </swiper-slide>
        <swiper-slide v-for="(slide, i) in slidesMobile" :key="i" class="block sm:hidden">
          <img :src="slide">
        </swiper-slide>
      </swiper-container>
    </div>
  </div>
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

const slidesMobile = [
  '/images/banner-square-01.png',
  '/images/banner-square-02.png',
  '/images/banner-square-03.png'
]

const slidesDesktop = [
  '/images/banner-04.png',
  '/images/banner-05.png',
  '/images/banner-06.png'
]
</script>
