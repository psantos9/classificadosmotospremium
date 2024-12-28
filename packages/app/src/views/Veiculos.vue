<template>
  <div class="flex-1 p-4 md:p-0 md:my-8 md:container md:mx-auto flex flex-col gap-8 items-center md:overflow-y-hidden">
    <div class="hidden md:block uppercase text-2xl font-black tracking-wide text-center">
      Anúncio de veículos
    </div>
    <div class="w-full flex-1 md:grid md:grid-cols-[19rem_auto] gap-8 overflow-y-hidden">
      <!-- filtros -->
      <div class="overflow-y-auto bg-white shadow rounded-md hidden md:flex flex-col divide-y">
        <div class="flex flex-col items-center p-4 gap-2">
          <FontAwesomeIcon :icon="faFilter" size="2xl" class="text-[var(--primary)]" />
          <span class="uppercase font-black">Filtrar anúncios</span>
        </div>
        <div>ano veiculo</div>
        <div>preco veiculo</div>
        <div>quilometragem veiculo</div>
        <div>Aplicad filtros</div>
      </div>
      <div class="flex-1 grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-4 overflow-y-auto">
        <div
          v-for="i in [...Array(20).keys()]" :key="i"
          class="grid-card"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<style scoped>
.grid-card {
  @apply bg-white shadow rounded-md h-[200px];
}
</style>
