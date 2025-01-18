<template>
  <footer class="bg-black text-white">
    <div class="mx-auto max-w-7xl p-4 flex items-center  justify-between">
      <p class="text-center text-sm/6 flex items-center justify-center gap-2">
        <img src="@/assets/images/full_logo_dark.svg" class="w-[150px]">
        &copy; {{ new Date().getFullYear() }}
      </p>
      <a v-for="item in navigation" :key="item.name" :href="item.href">
        <span class="sr-only">{{ item.name }}</span>
        <FontAwesomeIcon :icon="item.icon" size="2x" />
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const navigation = [

  {
    name: 'Facebook',
    href: 'https://www.instagram.com/classificadosmotospremium',
    icon: faInstagram
  }
]
</script>
