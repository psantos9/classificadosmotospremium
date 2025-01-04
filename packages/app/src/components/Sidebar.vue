<template>
  <div ref="target" class="sidebar" :open="sidebarOpen">
    <div class="flex flex-col items-center gap-8 py-8">
      <SignInButton @click="openSidebar(false)" />
      <div class="flex flex-col items-center gap-4">
        <RouterLink v-for="(item, i) in menuItems" :key="i" v-slot="{ navigate }" custom :to="item.to">
          <span class="px-2 py-1 font-medium uppercase cursor-pointer hover:text-[var(--primary)] transition-colors" @click="openSidebar(false); navigate()">{{ item.label }}</span>
        </RouterLink>
      </div>
      <AdvertiseHereButton @click="openSidebar(false)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AdvertiseHereButton from '@/components/AdvertiseHereButton.vue'
import SignInButton from '@/components/SignInButton.vue'
import { useApp } from '@/composables/useApp'
import { onClickOutside } from '@vueuse/core'
import { onUnmounted, ref, unref } from 'vue'

const { sidebarOpen, openSidebar, menuItems } = useApp()

const target = ref<HTMLElement | null>(null)

const onResizeHandler = () => {
  if (window.innerWidth > 960 && unref(sidebarOpen) === true) {
    openSidebar(false)
  }
}

onClickOutside(target, () => {
  if (unref(sidebarOpen)) {
    openSidebar(false)
  }
})

window.addEventListener('resize', onResizeHandler)
onUnmounted(() => window.removeEventListener('resize', onResizeHandler))
</script>

<style lang="sass" scoped>
.sidebar
  @apply fixed top-0 right-0 h-screen bg-[var(--main-header-bg)] text-white transition-all ease-in-out duration-500 z-50
  width: calc(100% - var(--main-header-size))
  &[open="false"]
    @apply translate-x-full
</style>
