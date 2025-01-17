<template>
  <a
    class="whatsapp-button fixed bottom-0 right-0 m-4 z-50 bg-[#18c139]  text-white shadow-md rounded-[50%] w-[60px] aspect-square flex items-center justify-center"
    href="https://wa.me/5562998590500"
    target="_blank"
  >
    <FontAwesomeIcon :icon="faWhatsapp" size="2x" />
  </a>
</template>

<script lang="ts" setup>
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<style scoped>
.whatsapp-button  {
  animation-name: pulse;
  animation-duration: 1.5s;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
  }
  80% {
    box-shadow: 0 0 0 14px rgba(37, 211, 102, 0);
  }
}
</style>
