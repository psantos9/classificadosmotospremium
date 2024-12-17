<template>
  <div class="flex items-center gap-2 text-xs font-semibold">
    <button class="border border-gray-300 rounded w-7 h-7">
      <FontAwesomeIcon :icon="faArrowLeft" size="sm" />
    </button>
    <span>pauloramires@gmail.com</span>
  </div>
</template>

<script lang="ts" setup>
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
