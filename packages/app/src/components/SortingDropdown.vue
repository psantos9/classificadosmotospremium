<template>
  <Listbox v-model="sortingOption">
    <div class="relative">
      <ListboxButton
        class="w-full min-w-[180px] relative rounded-md text-sm font-bold bg-white px-4 py-2 pr-10 text-left shadow-md focus:outline-none"
      >
        <span class="block truncate">{{ sortingOption.label }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <FontAwesomeIcon :icon="faChevronDown" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-md focus:outline-none text-sm"
        >
          <ListboxOption
            v-for="option of sortingOptions"
            v-slot="{ active, selected }"
            :key="option.key"
            :value="option"
            as="template"
          >
            <li
              class="relative cursor-default select-none py-2 px-4" :class="[active ? 'bg-amber-100 text-amber-900' : 'text-gray-900']"
            >
              <span
                class="block truncate" :class="[
                  selected ? 'font-medium' : 'font-normal',
                ]"
              >{{ option.label }}</span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { useApp } from '@/composables/useApp'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/vue'
import { ref } from 'vue'

const { sortingOption, sortingOptions } = useApp()
</script>
