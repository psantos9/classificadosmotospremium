<template>
  <div class="bg-[var(--main-header-bg)]">
    <header class="main-header">
      <div v-if="signature" class="hidden md:block absolute bottom-0 right-1 text-xs text-gray-500">
        {{ signature }}
      </div>
      <div class="flex items-center">
        <SidebarButton class="block md:hidden" />
        <button class="w-36 md:w-52 md:ml-4" @click.stop="navigateToHome">
          <img src="@/assets/images/full_logo_dark.svg">
        </button>
      </div>

      <div class="flex items-center gap-6 justify-end pr-4">
        <div class="hidden md:flex md:items-center gap-2">
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
          class="bg-[var(--primary)] hover:bg-[var(--primary-lighter)] text-[var(--primary-text)] px-4 py-2 rounded-md text-sm md:text-base font-bold flex items-center gap-2"
          @click="$router.push({ name: 'anuncie' })"
        >
          <span>Anuncie</span>
          <FontAwesomeIcon :icon="faBullhorn" />
        </button>
        <SignInButton class="hidden md:block max-w-[150px] shrink-0" />
      </div>
    </header>
  </div>
</template>

<script lang="ts" setup>
import SidebarButton from '@/components/SidebarButton.vue'
import SignInButton from '@/components/SignInButton.vue'
import { useApp } from '@/composables/useApp'
import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter } from 'vue-router'

const router = useRouter()
const { menuItems, scrollToTop } = useApp()
const signature = import.meta.env.MODE !== 'production' ? `release: ${__GIT_COMMIT_BRANCH__} #${__GIT_COMMIT_HASH__} / mode: ${import.meta.env.MODE}` : undefined

const navigateToHome = async () => {
  await router.push({ name: 'home' })
  scrollToTop()
}
</script>

<style lang="sass" scoped>
.main-header
  @apply bg-[var(--main-header-bg)] text-white h-[var(--main-header-size)]
  @apply flex items-center justify-between relative md:container md:mx-auto
</style>
