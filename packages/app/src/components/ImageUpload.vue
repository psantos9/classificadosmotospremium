<template>
  <div
    class="group flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer hover:bg-[var(--primary-lightest)] text-gray-600 hover:text-[var(--primary-text)] transition-colors"
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
import { useApp } from '@/composables/useApp'
import { ALLOWED_IMAGE_MIME_TYPES as allowedMimeTypes } from '@cmp/shared/constants'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

const fileUpload = ref<HTMLElement | null>(null)

const { api } = useApp()

const handleFileUpload = async (evt: Event) => {
  const adId = crypto.randomUUID()
  const files = (evt.target as HTMLInputElement).files ?? null
  if (files === null) {
    return
  }
  await api.uploadImages({ adId, files })
}
/*
  await uploadFiles((evt.target as HTMLInputElement).files ?? null).catch((err) => {
    const files = (evt.target as HTMLInputElement).files ?? []
    if (err instanceof AssetsStorageQuotaExceededError) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `Could not upload asset${
          files.length === 1 ? '' : 's'
        }, asset storage quota exceeded`,
        life: 3000
      })
    }
    else { throw err }
  })
    */
</script>
