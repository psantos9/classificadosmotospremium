<template>
  <Combobox
    v-model="model"
    as="div"
    class="relative"
    @update:model-value="query = ''"
  >
    <ComboboxInput
      class="w-full rounded-md outline-none border border-transparent focus:border-[var(--primary)] placeholder:font-semibold placeholder:text-base placeholder:text-gray-500 font-black text-base"
      placeholder="Digite o nome da marca ou modelo da moto"
      @focus="$emit('focus', $event)"
      @click="$emit('click', $event)"
      @change="query = $event.target.value"
      @blur="query = ''"
    />

    <ComboboxOptions v-if="options.length > 0" class="absolute z-10 max-h-60 mt-2 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
      <ComboboxOption v-for="(option, i) in options" :key="i" v-slot="{ active }" :value="option" as="template">
        <li class="relative select-none font-black text-sm px-4 py-2 cursor-pointer text-gray-600 transition-colors" :class="[active ? 'bg-gray-100' : '']">
          <span class="block truncate">
            {{ option.marca }} {{ option.modelo }}
          </span>
        </li>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>

<script lang="ts" setup generic="T extends object | string | number">
import { useApp } from '@/composables/useApp'

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/vue'
import debounce from 'lodash.debounce'
import { ref, watch } from 'vue'

defineEmits<{
  (e: 'input', value: T): void
  (e: 'focus', value: FocusEvent): void
  (e: 'click', value: Event): void
}>()

const { api } = useApp()
const model = defineModel<null | T>()

const query = ref('')
const options = ref<Array<{ marca: string, modelo: string }>>([])

const fetchGroupedHits = async (q: string) => {
  if (!q) {
    options.value = []
  }
  else {
    const _options = await api.fetchAnuncios({ q, groupBy: ['marca', 'modelo'] })
      .then(response => response
        .grouped_hits
        ?.map(({ group_key: [marca, modelo] }) => ({ marca, modelo })) ?? []
      )
    options.value = _options.sort((A, B) => A.marca > B.marca ? 1 : A.marca < B.marca ? -1 : A.modelo > B.modelo ? 1 : A.modelo < B.modelo ? -1 : 0)
  }
}

const debouncedFetchGroupedHits = debounce(fetchGroupedHits, 500)

watch(query, (query) => {
  debouncedFetchGroupedHits(query)
})
</script>
