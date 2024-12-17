<template>
  <div>
    <RouterLink :to="{ name: 'identificacao' }" class="flex items-center gap-3 hover:text-[var(--primary)] transition-colors">
      <FontAwesomeIcon :icon="faUserCircle" size="2x" />
      <span class="uppercase text-xs font-semibold">Entre ou cadastre-se</span>
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
