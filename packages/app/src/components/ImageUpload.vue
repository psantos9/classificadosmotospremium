<template>
  <div class="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer">
    <div class="text-center">
      <FontAwesomeIcon :icon="faImage" size="4x" class="text-[var(--primary)]" />
      <PhotoIcon class="mx-auto size-12 text-gray-300" aria-hidden="true" />
      <div class="mt-4 flex text-sm/6 text-gray-600">
        <input id="file-upload" type="file" class="sr-only">
        <span>Arraste uma imagem aqui ou clique para procurar no seu computador</span>
      </div>
      <p class="text-xs/5 text-gray-600">
        Adicione até 20 fotos nos formatos PNG, JPG, GIF, com até 10MB cada uma.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
