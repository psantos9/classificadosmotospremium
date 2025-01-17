<template>
  <div class="min-h-screen flex flex-col relative">
    <Header class="sticky top-0 z-50" />
    <Sidebar />
    <RouterView />
    <Footer />
    <a class="fixed bottom-0 right-0 m-4 shadow-md rounded-lg z-50" href="https://wa.me/5562998590500">
      <img src="@/assets/images/WhatsAppButtonGreenSmall.svg">
    </a>
  </div>
</template>

<script lang="ts" setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>
