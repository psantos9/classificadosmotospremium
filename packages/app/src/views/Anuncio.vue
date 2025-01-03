<template>
  <div class="flex-1 p-4 md:my-8 md:max-w-screen-lg md:mx-auto bg-white rounded-md md:grid md:grid-cols-2 gap-4">
    <div
      class="flex flex-col w-full h-full rounded-md"
      :class="[loading ? 'bg-gray-100 animate-pulse' : '']"
    >
      <swiper-container v-bind="options" class="w-full">
        <swiper-slide v-for="(foto, i) in fotos" :key="i">
          <ExpandableImage
            :src="foto"
            container-class="rounded-md bg-black aspect-video mx-auto w-full"
            class="h-full mx-auto rounded-md shadow-md"
          />
        </swiper-slide>
      </swiper-container>

      <swiper-container
        class="thumbs-swiper w-full"
        v-bind="optionsThumbs"
        style="--swiper-navigation-color: #fff; --swiper-pagination-color: #fff"
      >
        <swiper-slide v-for="(thumbnail, j) in fotos" :key="j">
          <img :src="thumbnail" class="cursor-pointer rounded-md object-fit">
        </swiper-slide>
      </swiper-container>
    </div>
    <div v-if="anuncio" class="flex flex-col gap-2 p-4">
      <div class="flex items-center justify-between">
        <div class="uppercase font-light text-xs text-gray-500">
          Código: {{ anuncio.id }}
        </div>
        <div class="uppercase font-light text-xs text-gray-500 flex gap-2 items-center">
          <FontAwesomeIcon :icon="faLocationDot" />
          {{ anuncio.localidade }} / {{ anuncio.uf }}
        </div>
      </div>

      <div class="text-4xl font-black">
        {{ anuncio.marca }}
      </div>
      <div class="text-2xl">
        {{ anuncio.modelo }}
      </div>
      <div class="text-4xl font-black text-[var(--success)]">
        {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(anuncio.preco) }}
      </div>
      <div class="py-8 flex justify-between md:grid md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
        <div v-for="(caracteristica, i) in caracteristicas" :key="i" class="flex items-center gap-4">
          <FontAwesomeIcon :icon="caracteristica.icon" class="text-[var(--primary)]" size="2x" />
          <div class="flex flex-col">
            <div class="text-sm font-light">
              {{ caracteristica.label }}
            </div>
            <div class="text-sm font-semibold">
              {{ caracteristica.value }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2 text-sm">
          <div class="font-semibold text-sm">
            Acessórios
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="id in anuncio.acessorios" :key="id" class="border px-1 rounded-md text-xs font-light bg-green-100 border-green-200 shadow">
              {{ acessorios.find(acessorio => acessorio.id === id)?.label }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Informações adicionais
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="id in anuncio.informacoesAdicionais" :key="id" class="border px-1 rounded-md text-xs font-light bg-yellow-100 border-yellow-200 shadow">
              {{ informacoesAdicionais.find(informacaoAdicional => informacaoAdicional.id === id)?.label }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="font-semibold text-sm">
            Mais sobre a moto
          </div>
          <div class="font-light text-xs">
            {{ anuncio.descricao || 'Sem descrição' }}
          </div>
        </div>
      </div>
    </div>
    <div class="rounded-md shadow border bg-gray-100 p-4 flex flex-col gap-4">
      <div class="text-lg font-black">
        Sobre o anunciante
      </div>
      <div class="flex gap-4 item-center">
        <div class="bg-black rounded-md shadow aspect-square flex items-center justify-center">
          <img src="@/assets/images/logo_dark.svg" class="h-24 mx-auto">
        </div>
        <div class="flex flex-col justify-between gap-3">
          <span class="font-black text-base">{{ anuncio?.usuario.nomeFantasia ?? 'Particular' }}</span>
          <span class="flex items-center gap-2">
            <FontAwesomeIcon :icon="faLocationDot" />
            <span class="font-thin">{{ anuncio?.usuario.localidade }} - {{ anuncio?.usuario.uf }}</span>
          </span>
          <span v-if="anuncio" class="font-thin text-xs">No site desde  {{ format(parseISO(anuncio.usuario.createdAt), 'MM \'de\' MMMM yyyy', { locale: ptBR }) }}</span>
          <!--
          <button
            type="button"
            class="flex items-center gap-1 text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none"
          >
            <FontAwesomeIcon :icon="faPhone" />
            Ver telefone
          </button>
          -->
        </div>
      </div>
    </div>
    <div class="rounded-md shadow border p-4 flex flex-col gap-4 bg-gray-100">
      <div class="text-lg font-black">
        Enviar proposta
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <template v-if="!signedIn">
          <div class="col-span-full relative">
            <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome</label>
            <input id="name" v-model="name" class="form-input" v-bind="nameAttrs">
            <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
              {{ errors.name }}
            </p>
          </div>
          <div class="ol-span-full relative">
            <label for="mobile" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefone</label>
            <input
              id="mobile"
              v-model="mobile"
              v-maska="{ mask: '(##) #########' }"
              v-bind="mobileAttrs"
              type="text"
              autocomplete="off"
              class="form-input"
            >
            <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
              {{ errors.mobile }}
            </p>
          </div>
          <div class="ol-span-full relative">
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input id="email" v-model="email" class="form-input" v-bind="emailAttrs">
            <p class="absolute text-xs text-[var(--danger)] -bottom-4 right-0">
              {{ errors.email }}
            </p>
          </div>
        </template>

        <div class="col-span-full">
          <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mensagem</label>
          <textarea
            id="message"
            v-model="message"
            rows="4"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border-2 border-gray-300 focus:border-[var(--primary)] !ring-0" :placeholder="`Gostei do seu anúncio da ${anuncio?.marca} ${anuncio?.modelo} e gostaria de mais informações.`"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-center items-center">
        <button
          type="button"
          :disabled="sendingMessageDisabled"
          class="flex items-center justify-center gap-1 text-[var(--primary-text)] bg-[var(--primary)] hover:bg-[var(--primary-lighter)] font-medium rounded-md text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none transition-all"
          :class="[sendingMessageDisabled ? 'opacity-70 pointer-events-none' : '']"
          @click="enviarMensagem"
        >
          Enviar mensagem
          <FontAwesomeIcon :icon="sendingMessage ? faSpinner : faChevronRight" :spin="sendingMessage" fixed-width />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicAd } from '@cmp/shared/models/database/models'
import type { SwiperOptions } from 'swiper/types'
import ExpandableImage from '@/components/ExpandableImage.vue'
import { useApp } from '@/composables/useApp'
import { getUnauthenticatedMessageSenderSchema } from '@cmp/shared/models/nova-mensagem'
import { faCalendarAlt, faChevronRight, faLocationDot, faPalette, faSpinner, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toTypedSchema } from '@vee-validate/zod'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { vMaska } from 'maska/vue'
import { register } from 'swiper/element/bundle'
import { useForm } from 'vee-validate'
import { type Component, computed, ref, unref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

export interface ICaracteristica {
  icon: Component
  label: string
  value: string
}

const anonymousMessageSenderSchema = toTypedSchema(getUnauthenticatedMessageSenderSchema())

const { errors, defineField, values, meta, resetForm } = useForm({
  validationSchema: anonymousMessageSenderSchema
})

const [email, emailAttrs] = defineField('email', { validateOnInput: false, validateOnModelUpdate: false, validateOnChange: false, validateOnBlur: true })
const [mobile, mobileAttrs] = defineField('mobile')
const [name, nameAttrs] = defineField('name')

const getCaracteristicas = (anuncio: PublicAd | null): ICaracteristica[] => {
  if (anuncio === null) {
    return []
  }
  const { ano, anoModelo, quilometragem, cor } = anuncio
  const caracteristicas: ICaracteristica[] = [
    { icon: faCalendarAlt, label: 'Ano', value: `${ano}/${anoModelo}` },
    { icon: faTachometerAlt, label: 'Quilometragem', value: `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(quilometragem)} km` },
    { icon: faPalette, label: 'Cor', value: cor.label.toString() }
  ]
  return caracteristicas
}

register()

const router = useRouter()
const { api, informacoesAdicionais, acessorios, signedIn } = useApp()
const toast = useToast()

const adId = Number.parseInt(unref(router.currentRoute).params.id as string ?? '')

if (Number.isNaN(adId)) {
  router.push({ name: 'anuncios' })
}

const loading = ref(false)
const sendingMessage = ref(false)
const message = ref('')
const fotos = ref<string[]>([])
const anuncio = ref<PublicAd | null>(null)
const caracteristicas = ref<ICaracteristica[]>([])

const options: SwiperOptions = {
  thumbs: {
    swiper: '.thumbs-swiper'
  },
  navigation: true,
  spaceBetween: 10
}

const optionsThumbs: SwiperOptions = {
  slidesPerView: 4,
  spaceBetween: 10
}

const fetchAnuncio = async () => {
  try {
    loading.value = true
    anuncio.value = await api.fetchAnuncio(adId)
    fotos.value = (unref(anuncio)?.fotos ?? []).map(foto => api.getImageUrl(foto))
    caracteristicas.value = getCaracteristicas(unref(anuncio))
  }
  finally {
    loading.value = false
  }
}

const enviarMensagem = async () => {
  const adId = unref(anuncio)?.id ?? null
  const content = unref(message)
  if (adId === null) {
    return
  }
  const sender = getUnauthenticatedMessageSenderSchema().parse(unref(values))
  try {
    sendingMessage.value = true
    await api.enviaMensagem({ adId, content, sender })
    toast.success('Mensagem enviada com sucesso!')
    message.value = ''
    resetForm()
  }
  finally {
    sendingMessage.value = false
  }
}

const sendingMessageDisabled = computed(() => {
  const _signedIn = unref(signedIn)
  const content = unref(message)
  const sending = unref(sendingMessage)
  const { valid, touched } = unref(meta)
  const disabled = sending || !content || (!_signedIn && !touched && !valid)
  return disabled
})

fetchAnuncio()
</script>

<style lang="sass" scoped>
swiper-container.thumbs-swiper
  @apply py-2
</style>
