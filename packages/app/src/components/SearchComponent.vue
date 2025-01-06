<template>
  <div class="w-full flex justify-center items-center z-10 ">
    <div class="relative z-10 grid grid-cols-6 gap-4 md:gap-8 w-full md:max-w-screen-md items-center justify-center md:rounded-xl bg-black py-8 px-4 md:px-8">
      <div class="uppercase font-bold text-base md:text-2xl tracking-wide text-white col-span-full text-center">
        Encontre o veículo ideal para você
      </div>
      <Autocomplete :data="['teste', 'ok']" class="flex-1 w-full col-span-full md:col-span-4" @focus="focusHandler" @click="focusHandler" />
      <button
        class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] rounded-md md:h-[3.5rem] py-2.5 uppercase text-base font-black flex gap-2 items-center justify-center px-8 transition-colors col-span-full md:col-span-2"
        @click="$router.push({ name: 'anuncios' })"
      >
        <FontAwesomeIcon :icon="faMotorcycle" size="xl" />
        <span>Ver ofertas</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Autocomplete from '@/components/Autocomplete.vue'
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const focusHandler = (evt: Event) => {
  (evt.target as Element)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}
</script>
