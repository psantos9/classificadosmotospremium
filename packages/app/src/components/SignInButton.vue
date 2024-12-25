<template>
  <div>
    <RouterLink
      v-slot="{ navigate }"
      custom
      :to="{ name: signedIn ? 'minha-conta' : 'identificacao' }"
    >
      <div
        class="flex items-center gap-3 hover:text-[var(--primary-lighter)] transition-colors cursor-pointer"
        @click="navigate"
      >
        <FontAwesomeIcon :icon="faUserCircle" size="2x" />
        <span class="uppercase text-xs font-semibold">{{ signedIn ? 'Minha conta' : 'Entre ou cadastre-se' }}</span>
      </div>
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { signedIn } = useApp()
</script>
