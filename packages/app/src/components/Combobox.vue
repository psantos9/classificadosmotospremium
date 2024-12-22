<template>
  <Combobox v-model="model" as="div" @update:model-value="query = ''">
    <ComboboxLabel class="block text-sm/6 font-medium">
      {{ label }}
    </ComboboxLabel>
    <div class="relative mt-2">
      <ComboboxInput
        class="block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
        :display-value="(option: any) => option?.value"
        @change="query = $event.target.value"
        @blur="query = ''"
      />
      <ComboboxButton v-slot="{ open }" class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
        <FontAwesomeIcon :icon="open ? faChevronUp : faChevronDown" />
      </ComboboxButton>

      <ComboboxOptions v-if="filteredOptions.length > 0" class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
        <ComboboxOption v-for="option in filteredOptions" :key="option.key" v-slot="{ active, selected }" :value="option" as="template">
          <li class="relative select-none py-2 pl-3 pr-9 cursor-pointer" :class="[active ? 'bg-[var(--primary)] outline-none' : 'text-gray-900']">
            <span class="block truncate" :class="[selected && 'font-medium']">
              {{ option.value }}
            </span>

            <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4">
              <FontAwesomeIcon :icon="faCheck" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>

<script lang="ts" setup>
import { faCheck, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/vue'

import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{
  label: string
  data: Array<{ key: string, value: string }>
  filteringFn?: (query: string, data: Array<{ key: string, value: string }>) => Array<{ key: string, value: string }>
}>()
defineEmits<{ (e: 'input', value: string): void }>()

const model = defineModel<null | { key: string, value: string }>()
const { filteringFn, data } = toRefs(props)

const query = ref('')

const filteredOptions = computed(() => {
  const _query = unref(query)
  const dataset = unref(data)
  const defaultFilteringFn = (query: string) => query.length === 0 ? dataset : dataset.filter(item => item.value.toLowerCase().includes(query.toLowerCase()))
  const _filterinfFn = unref(filteringFn)
  const filteredDataset = (_filterinfFn ?? defaultFilteringFn)(_query, dataset)
  return filteredDataset
})
</script>
