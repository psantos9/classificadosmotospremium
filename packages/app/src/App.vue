<template>
  <div class="test h-screen flex flex-col">
    <Header class="sticky top-0 z-50" />
    <Sidebar />
    <div class="flex-1 overflow-y-auto flex flex-col">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>
