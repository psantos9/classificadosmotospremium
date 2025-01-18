<template>
  <span class="mt-4 title mx-auto">Forma de entrada</span>
  <button type="button" class="w-60 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm" @click="emit('signinMethod', 'password')">
    <FontAwesomeIcon :icon="faKey" size="lg" />
    Entrar com a senha
  </button>
  <!--
  <div class="opt-divider">
    <div class="opt-divider-content">
      ou
    </div>
  </div>
  <button
    type="button"
    class="w-60 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm" @click="emit('signinMethod', 'pin')">
    <FontAwesomeIcon :icon="faTh" size="lg" />
    Entrar com um PIN
  </button>
  -->
</template>

<script lang="ts" setup>
import { faKey, faTh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onBeforeUnmount } from 'vue'

const emit = defineEmits<{ (e: 'signinMethod', method: 'password' | 'pin'): void }>()

const keydownEventHandler = async (evt: KeyboardEvent) => {
  const { key } = evt
  if (key === 'Enter') {
    emit('signinMethod', 'password')
  }
}

window.addEventListener('keydown', keydownEventHandler)
onBeforeUnmount(() => window.removeEventListener('keydown', keydownEventHandler))
</script>
