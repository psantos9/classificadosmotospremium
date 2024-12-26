<template>
  <Combobox
    v-model="model"
    as="div"
    :disabled="loading"
    @update:model-value="query = ''"
    @click="clickHandler"
  >
    <ComboboxLabel class="block text-sm/6 font-medium">
      {{ label }}
    </ComboboxLabel>
    <div class="relative mt-2">
      <ComboboxInput
        class="block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
        :display-value="(option: any) => typeof option === 'object' ? option?.[labelKey] : option"
        @change="query = $event.target.value"
        @blur="query = ''"
      />
      <ComboboxButton v-slot="{ open }" ref="buttonEl" class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
        <FontAwesomeIcon :icon="loading ? faSpinner : open ? faChevronUp : faChevronDown" :spin="loading" />
      </ComboboxButton>

      <ComboboxOptions v-if="filteredOptions.length > 0" class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
        <ComboboxOption v-for="option in filteredOptions" :key="option.key" v-slot="{ active, selected }" :value="option" as="template">
          <li class="relative select-none py-2 pl-3 pr-9 cursor-pointer" :class="[active ? 'bg-[var(--primary)] outline-none' : 'text-gray-900']">
            <span class="block truncate" :class="[selected && 'font-medium']">
              {{ typeof option === 'object' ? option[labelKey] : option }}
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

<script lang="ts" setup generic="T extends object | string | number">
import { faCheck, faChevronDown, faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons'
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
  data: Array<T>
  labelKey?: keyof T
  loading?: boolean
  filteringFn?: (query: string, data: Array<T>) => Array<T>
}>()
defineEmits<{ (e: 'input', value: T): void }>()

const model = defineModel<null | T>()
const { filteringFn, data, labelKey } = toRefs(props)

const query = ref('')
const buttonEl = ref<any>(null)

const filteredOptions = computed(() => {
  const _query = unref(query)
  const dataset = unref(data)
  const defaultFilteringFn = (query: string) => query.length === 0 ? dataset : dataset.filter((option: T) => typeof option === 'string' ? option.toLowerCase().includes(query.toLowerCase()) : (option[unref(labelKey)] as string)?.toLowerCase?.()?.includes(query.toLowerCase()))
  const _filterinfFn = unref(filteringFn)
  const filteredDataset = (_filterinfFn ?? defaultFilteringFn)(_query, dataset)
  return filteredDataset
})

const clickHandler = () => {
  unref(buttonEl)?.$el?.click()
}
</script>
