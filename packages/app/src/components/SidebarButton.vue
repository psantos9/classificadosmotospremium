<template>
  <div class="sidebar-button">
    <button class="bg-[var(--primary)] text-black h-[var(--main-header-size)] w-[var(--main-header-size)] flex items-center justify-center" @click.stop="openSidebar(!sidebarOpen)">
      <FontAwesomeIcon v-if="!sidebarOpen" :icon="faBars" size="xl" />
      <FontAwesomeIcon v-else :icon="faTimes" size="xl" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { sidebarOpen, openSidebar } = useApp()
</script>
