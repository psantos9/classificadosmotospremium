<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        Cadastro do Anúncio
      </div>
      <div class="card-section">
        <span class="title">Dados do Veículo</span>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <Combobox
            class="sm:col-span-3"
            label="Marca"
            :data="marcas"
          />
          <div class="sm:col-span-3">
            <label for="name" class="block text-sm/6 font-medium">Marca</label>
            <div class="mt-2 relative">
              <input
                id="name"
                type="text"
                class="form-input"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Combobox from '@/components/Combobox.vue'

const marcas = [
  { key: 'triumph', value: 'Triumph' },
  { key: 'harleyDavidson', value: 'Harley Davidson' }
]
</script>
