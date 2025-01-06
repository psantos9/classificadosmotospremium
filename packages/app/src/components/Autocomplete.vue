<template>
  <Combobox
    v-model="model"
    as="div"
    :disabled="loading"
    class="relative"
    @update:model-value="query = ''"
  >
    <ComboboxInput
      class="md:h-[3.5rem] w-full rounded-md outline-none border border-transparent focus:border-[var(--primary)] px-4 placeholder:font-semibold placeholder:text-sm placeholder:text-gray-500 font-black text-sm"
      placeholder="Digite o nome da marca ou modelo da moto"
      :display-value="(option: any) => typeof option === 'object' ? option?.[labelKey] : option"
      @change="query = $event.target.value"
      @blur="query = ''"
    />

    <ComboboxOptions v-if="filteredOptions.length > 0" class="absolute z-10 max-h-60 mt-2 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
      <ComboboxOption v-for="option in filteredOptions" :key="option.key" v-slot="{ active }" :value="option" as="template">
        <li class="relative select-none font-black text-sm px-4 py-2 cursor-pointer text-gray-600 transition-colors" :class="[active ? 'bg-gray-100' : '']">
          <span class="block truncate">
            {{ typeof option === 'object' ? option[labelKey] : option }}
          </span>
        </li>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>

<script lang="ts" setup generic="T extends object | string | number">
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/vue'

import { computed, ref, toRefs, unref } from 'vue'

const props = defineProps<{
  data: Array<T>
  labelKey?: keyof T
  loading?: boolean
  filteringFn?: (query: string, data: Array<T>) => Array<T>
}>()
defineEmits<{ (e: 'input', value: T): void }>()

const model = defineModel<null | T>()
const { filteringFn, data, labelKey } = toRefs(props)

const query = ref('')

const filteredOptions = computed(() => {
  const _query = unref(query)
  const dataset = unref(data)
  const defaultFilteringFn = (query: string) => query.length === 0 ? dataset : dataset.filter((option: T) => typeof option === 'string' ? option.toLowerCase().includes(query.toLowerCase()) : (option[unref(labelKey)] as string)?.toLowerCase?.()?.includes(query.toLowerCase()))
  const _filterinfFn = unref(filteringFn)
  const filteredDataset = (_filterinfFn ?? defaultFilteringFn)(_query, dataset)
  return filteredDataset
})
</script>
