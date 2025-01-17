<template>
  <div class="scroll-container min-h-screen flex flex-col relative">
    <Header class="sticky top-0 z-50" />
    <Sidebar />
    <RouterView />
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>
