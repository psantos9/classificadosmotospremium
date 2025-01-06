<template>
  <header class="main-header">
    <div v-if="signature" class="hidden md:block absolute bottom-0 right-1 text-xs text-gray-500">
      {{ signature }}
    </div>
    <SidebarButton class="block md:hidden" />
    <button class="w-32 md:w-52 md:p-4 justify-self-start" @click="$router.push({ name: 'home' })">
      <img src="@/assets/images/full_logo_dark.svg" class="h-full">
    </button>

    <div class="flex items-center gap-6 justify-end pr-4">
      <div class="hidden md:flex gap-4">
        <RouterLink
          v-for="(item, i) in menuItems" :key="i" v-slot="{ isExactActive, navigate }" :to="item.to" custom
        >
          <span
            class="px-2 py-1 text-sm font-medium cursor-pointer uppercase transition-color"
            :class="[
              isExactActive ? 'text-[var(--primary)]' : 'hover:text-[var(--primary-lighter)]',
            ]"
            @click="navigate"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </div>
      <button
        class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] mx-2 px-2 py-1 rounded-md text-xs md:text-base font-semibold flex items-center gap-1 md:gap-2"
        @click="$router.push({ name: 'anuncie' })"
      >
        <span>Anuncie</span>
        <FontAwesomeIcon :icon="faBullhorn" />
      </button>
      <SignInButton class="hidden md:block max-w-[150px]" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import SidebarButton from '@/components/SidebarButton.vue'
import SignInButton from '@/components/SignInButton.vue'
import { useApp } from '@/composables/useApp'
import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { menuItems } = useApp()
const signature = import.meta.env.MODE !== 'production' ? `release: ${__GIT_COMMIT_BRANCH__} #${__GIT_COMMIT_HASH__} / mode: ${import.meta.env.MODE}` : undefined
</script>

<style lang="sass" scoped>
.main-header
  @apply bg-[var(--main-header-bg)] text-white h-[var(--main-header-size)]
  @apply w-full grid grid-cols-3 md:grid-cols-2 items-center justify-between relative
</style>
