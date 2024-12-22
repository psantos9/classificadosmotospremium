<template>
  <div class="test h-screen relative">
    <Header />
    <Sidebar />
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>
