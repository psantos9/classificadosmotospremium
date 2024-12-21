<template>
  <div class="test h-screen relative">
    <Header />
    <Sidebar />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style lang="sass" scoped>
.main-content
  @apply p-4 md:p-14 max-w-screen-2xl mx-auto
</style>
