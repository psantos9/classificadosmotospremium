<template>
  <div>
    <button @click="onClick">
      Click me
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const onClick = () => {
  toast.error('hi there')
}
</script>
