<template>
  <header class="main-header">
    <div class="flex items-center gap-4">
      <SidebarButton class="block md:hidden" />
      <RouterLink :to="{ name: 'home' }" class="w-36 md:w-52 md:pl-4">
        <img src="@/assets/main-logo.svg">
      </RouterLink>
    </div>

    <div class="flex items-center gap-6 justify-end pr-4">
      <div class="hidden md:flex gap-4">
        <RouterLink
          v-for="(item, i) in menuItems" :key="i" v-slot="{ isExactActive, navigate }" :to="item.to" custom
        >
          <span
            class="px-2 py-1 text-sm font-medium cursor-pointer uppercase hover:text-[var(--primary)] transition-color"
            :class="[
              isExactActive ? 'text-[var(--primary)]' : '',
            ]"
            @click="navigate"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </div>
      <AdvertiseHereButton :flat="true" class="block md:hidden" />
      <AdvertiseHereButton class="hidden md:block" />
      <SignInButton class="hidden md:block max-w-[150px]" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import AdvertiseHereButton from '@/components/AdvertiseHereButton.vue'
import SidebarButton from '@/components/SidebarButton.vue'
import SignInButton from '@/components/SignInButton.vue'
import { useApp } from '@/composables/useApp'

const { menuItems } = useApp()
</script>

<style lang="sass" scoped>
.main-header
  @apply bg-[var(--main-header-bg)] text-white h-[var(--main-header-size)]
  @apply flex flex-nowrap w-full items-center justify-between md:px-4
</style>
