<template>
  <div class="view-container">
    <div class="card">
      <div class="card-header">
        Cadastro do Anúncio
      </div>
      <div class="card-section">
        <span class="title">Dados do Veículo</span>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-6">
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Marca"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Modelo"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Versão"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Combustível"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Cor"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Câmbio"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Ano Fabricação"
            :data="marcas"
          />

          <Combobox
            v-model="marca"
            class="sm:col-span-3"
            label="Ano Modelo"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-2"
            label="Número portas"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-2"
            label="Estado de Uso"
            :data="marcas"
          />
          <Combobox
            v-model="marca"
            class="sm:col-span-2"
            label="Quilometragem atual"
            :data="marcas"
          />
        </div>
        <span class="title">Preço</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Combobox from '@/components/Combobox.vue'
import { ref } from 'vue'

const marca = ref(null)
const marcas = [
  { key: 'triumph', value: 'Triumph' },
  { key: 'harleyDavidson', value: 'Harley Davidson' }
]
</script>
