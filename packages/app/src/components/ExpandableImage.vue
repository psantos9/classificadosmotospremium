<template>
  <div
    class="expandable-image"
    :class="containerClass"
    :data-expanded="expanded"
    @click="clickHandler"
  >
    <img :src="api.getImageUrl({ imageId, thumbnail: false })" class="mx-auto object-fit h-full">
  </div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="expanded" class="fixed inset-0 bg-black z-50 cursor-zoom-out flex flex-col items-center justify-center" @click="expanded = false">
        <img :src="api.getImageUrl({ imageId })" class="max-h-full object-contain">
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useApp } from '@/composables/useApp'
import { ref, unref } from 'vue'

defineProps<{ imageId: string, imgClass?: string, containerClass?: string }>()

const { api } = useApp()
const expanded = ref(false)

const clickHandler = () => {
  expanded.value = !unref(expanded)
}
</script>

<style lang="sass" scoped>
.expandable-image
  @apply cursor-zoom-in relative transition-opacity overflow-hidden
  &[data-expanded=true]
    @apply fixed top-0 left-0 bottom-0 right-0 bg-black
</style>
