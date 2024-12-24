<template>
  <div class="test h-screen">
    <div class="flex flex-col">
      <Header class="sticky top-0 z-50" />
      <Sidebar />
      <div class="overflow-y-hidden">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>
