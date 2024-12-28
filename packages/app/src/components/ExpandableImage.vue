<template>
  <div
    class="expandable-image"
    :data-expanded="expanded"
    @click="clickHandler"
  >
    <img v-bind="$attrs">
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
      <div v-if="expanded" class="fixed inset-0 w-full h-full bg-black z-50 cursor-zoom-out" @click="expanded = false">
        <img v-bind="$attrs" class="object-contain">
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue'

defineProps<{ imgClass: string }>()
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
