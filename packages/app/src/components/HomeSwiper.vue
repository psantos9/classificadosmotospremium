<template>
  <div class="bg-black">
    <div class="max-w-[1980px] mx-auto">
      <swiper-container v-bind="options">
        <swiper-slide v-for="(slide, i) in slides" :key="i">
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

const slides = [
  '/images/banner-01.png',
  '/images/banner-02.png',
  '/images/banner-03.png',
  '/images/banner-04.png',
  '/images/banner-05.png',
  '/images/banner-06.png'
]
</script>
