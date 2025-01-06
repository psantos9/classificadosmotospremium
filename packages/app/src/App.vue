<template>
  <div class="h-screen flex flex-col">
    <Header />
    <Sidebar />
    <div ref="scrollContainer" class="scroll-container flex-1 overflow-y-auto flex flex-col">
      <RouterView />
    </div>
  </div>
  <Transition
    enter-active-class="transition-opacity"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="y > 0"
      type="button"
      class="fixed bottom-0 right-0 w-16 h-16 md:w-10 md:h-10 m-2 shadow-md bg-[var(--primary)] hover:bg-[var(--primary-darker)] text-[var(--primary-text)] focus:outline-none rounded-full text-center flex justify-center items-center"
      @click.stop="scrollToTop"
    >
      <FontAwesomeIcon :icon="faArrowUp" fixed-width size="2x" class="md:hidden" />
      <FontAwesomeIcon :icon="faArrowUp" fixed-width size="xl" class="hidden md:block" />
    </button>
  </Transition>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useApp } from '@/composables/useApp'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useScroll } from '@vueuse/core'
import { ref } from 'vue'

const scrollContainer = ref<HTMLElement | null>(null)

const { y } = useScroll(scrollContainer)
const { scrollToTop } = useApp()
</script>
