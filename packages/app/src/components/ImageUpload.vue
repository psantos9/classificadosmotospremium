<template>
  <div
    class="h-full group relative flex justify-center items-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer hover:bg-[var(--primary-lightest)] text-gray-600 hover:text-[var(--primary-text)] transition-colors data-[disabled=true]:pointer-events-none"
    :data-disabled="uploading"
    @click="fileUpload?.click()"
  >
    <div class="text-center">
      <FontAwesomeIcon :icon="faImage" size="4x" class="text-[var(--primary)] group-hover:text-[var(--primary-text)] transition-colors" />
      <div class="mt-4 flex text-sm/6">
        <input
          ref="fileUpload"
          type="file"
          hidden
          :accept="allowedMimeTypes"
          multiple
          @change="handleFileUpload"
        >
        <input id="file-upload" type="file" class="sr-only">
        <span>Arraste uma imagem aqui ou clique para procurar no seu computador</span>
      </div>
      <p class="text-xs/5">
        Adicione até 20 fotos nos formatos PNG, JPG, GIF, com até 10MB cada uma.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IImageUploadEvent } from '@/composables/api-client'
import type { Anuncio } from '@cmp/shared/models/database/schema'
import { useApp } from '@/composables/useApp'
import { ALLOWED_IMAGE_MIME_TYPES as allowedMimeTypes } from '@cmp/shared/constants'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref, toRefs, unref } from 'vue'
import { useToast } from 'vue-toast-notification'

const props = defineProps<{ anuncio: Anuncio }>()

const emit = defineEmits<{
  (e: 'update', value: Anuncio): void
  (e: 'image', value: IImageUploadEvent): void

}>()

const fileUpload = ref<HTMLElement | null>(null)
const done = ref(0)
const uploading = ref(false)

const { anuncio } = toRefs(props)
const { api } = useApp()
const toast = useToast()

const handleFileUpload = async (evt: Event) => {
  const adId = unref(anuncio).id
  const files = (evt.target as HTMLInputElement).files ?? null
  if (files === null) {
    return
  }

  try {
    uploading.value = true
    const anuncioAtualizado = await api.uploadImages({ adId, files, onUploadProgress: event => emit('image', event) })
    emit('update', anuncioAtualizado)
  }
  catch (err) {
    toast.error('Ocorreu um erro ao carregar as images')
    console.error(err)
  }
  finally {
    uploading.value = false
    done.value = 0
  }
}
</script>
