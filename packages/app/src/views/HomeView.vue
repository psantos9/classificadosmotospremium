<template>
  <div class="flex flex-col flex-1 bg-gray-100">
    <HomeSwiper />
    <SearchComponent class="md:translate-y-[-30px]" />
    <HighlightsComponent class="md:translate-y-[-30px]" />
  </div>
</template>

<script lang="ts" setup>
import HighlightsComponent from '@/components/HighlightsComponent.vue'
import HomeSwiper from '@/components/HomeSwiper.vue'
import SearchComponent from '@/components/SearchComponent.vue'
</script>
