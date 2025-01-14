<template>
  <div class="w-full bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
    <div>
      {{ thread.ultimaAtualizacao }}
    </div>
    <div>
      {{ thread.anuncio }}
    </div>
    <div>anonymous? {{ thread.sender === null }}</div>
    <div>
      {{ thread.unauthenticatedSender }}
    </div>
    <div>
      {{ thread.sender }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IThread } from '@cmp/shared/models/thread'

defineProps<{ thread: IThread }>()
</script>
