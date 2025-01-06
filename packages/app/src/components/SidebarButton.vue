<template>
  <button
    type="button"
    class="sidebar-button text-[var(--primary)] hover:bg-[var(--primary)] focus:outline-none font-medium text-sm p-2 text-center inline-flex items-center me-2"
    @click.stop="clickHandler"
  >
    <FontAwesomeIcon v-if="!sidebarOpen" :icon="faBars" size="xl" fixed-width />
    <FontAwesomeIcon v-else :icon="faTimes" size="xl" fixed-width />
  </button>
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { sidebarOpen, openSidebar } = useApp()

const clickHandler = () => {
  console.log(new Date())
  openSidebar(!sidebarOpen.value)
}
</script>
