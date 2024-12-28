<template>
  <div class="relative z-10 flex flex-col items-center justify-center rounded-xl bg-black p-12 mx-14">
    <div class="uppercase font-bold text-2xl tracking-wide  text-white">
      Encontre o veículo ideal para você
    </div>
    <div class="mt-8 flex items-center gap-8 w-full max-w-3xl">
      <Autocomplete :data="['teste', 'ok']" class="flex-1" />
      <button class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] rounded-md h-[3.5rem] uppercase text-sm font-black flex gap-2 items-center justify-center px-8 transition-colors">
        <FontAwesomeIcon :icon="faMotorcycle" size="lg" />
        <span>Ver ofertas</span>
      </button>
    </div>
    <div>
      <button class="mt-6 border border-[var(--primary)] hover:border-[var(--primary-lighter)] text-[var(--primary)] hover:text-[var(--primary-lighter)] rounded-md text-base font-bold flex gap-2 items-center justify-center px-4 py-1 transition-colors">
        <FontAwesomeIcon :icon="faSliders" />
        <span>Busca avançada</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Autocomplete from '@/components/Autocomplete.vue'
import { faMotorcycle, faSliders } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
