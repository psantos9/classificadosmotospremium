<template>
  <div class="h-screen flex flex-col">
    <Header />
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
