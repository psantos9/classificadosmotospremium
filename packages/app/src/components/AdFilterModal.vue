<template>
  <button
    class="bg-[var(--secondary)] hover:bg-[var(--secondary-lighter)] text-[var(--secondary-text)] px-4 py-2 rounded-md text-sm md:text-base font-bold flex items-center gap-2 shadow-md"
    @click="openModal"
  >
    <span>Filtrar</span>
    <FontAwesomeIcon :icon="faFilter" />
  </button>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-10" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-md bg-white text-left align-middle transition-all">
              <AdsFilter v-model="state" :close="closeModal" :facet-counts="facetCounts" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import type { TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import type { TAdsFacetCounts } from '@cmp/shared/models/typesense'
import AdsFilter from '@/components/AdsFilter.vue'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { ref } from 'vue'

defineProps<{ facetCounts: TAdsFacetCounts, close?: () => void }>()
const state = defineModel<{ filter: TAdsFilter | null, q: string }>({ required: true })
const isOpen = ref(false)

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}
</script>
