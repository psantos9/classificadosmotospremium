<template>
  <div>
    <RouterLink
    di
      :to="{ name: 'anuncie' }"
      class="rounded h-[2.5rem] px-4 flex items-center gap-2 transition-colors"
      :class="[flat ? 'text-[var(--primary)]' : 'bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] font-semibold']"
    >
      <span>Anuncie aqui</span>
      <FontAwesomeIcon :icon="faBullhorn" size="lg" />
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{ flat?: boolean }>()
</script>
