<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        v-slot="{ open }"
        class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--secondary)] text-[var(--secondary-text)] px-4 py-2 text-xs md:text-sm font-medium hover:bg-[var(--secondary-lighter)] transition-colors focus:outline-none"
      >
        Ações
        <FontAwesomeIcon :icon="faChevronDown" class="transition-all" :class="[open ? 'rotate-180' : '']" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
      >
        <div class="px-1 py-1">
          <MenuItem v-for="(action, i) in actions" :key="i" v-slot="{ active }">
            <button
              class="group flex w-full items-center rounded-md px-2 py-2 text-sm data-[active=true]:bg-gray-100 transition-colors" :data-active="active"
              @click.stop="action.action()"
            >
              <FontAwesomeIcon class="mr-2 text-[var(--primary)]" :icon="action.icon" />
              {{ action.label }}
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { faChevronDown, faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'view'): void
  (e: 'delete'): void
}>()

const actions = [
  { label: 'Editar', icon: faEdit, action: () => emit('edit') },
  { label: 'Visualizar', icon: faEye, action: () => emit('view') },
  { label: 'Remover', icon: faTrash, action: () => emit('delete') }
]
</script>
