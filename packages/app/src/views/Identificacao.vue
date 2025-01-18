<template>
  <div class="view-container flex-1 flex flex-col items-center justify-center">
    <div class="card max-w-screen-xs w-full mx-auto">
      <div class="card-header">
        Identificação
      </div>
      <div class="card-section">
        <div class="max-w-xs w-full mx-auto flex flex-col items-center gap-4">
          <div class="relative">
            <FontAwesomeIcon :icon="faCircle" size="4x" />
            <FontAwesomeIcon :icon="faUserCircle" size="4x" class="text-primary absolute top-0 left-0" />
          </div>

          <ValidateEmailForm v-if="phase === SignInPhase.Username" @email-verified="emailVerifiedHandler" />
          <template v-if="phase !== SignInPhase.Username">
            <div class="flex items-center gap-2 text-xs font-semibold" @click="phase = SignInPhase.Username">
              <button class="border border-gray-300 rounded w-7 h-7">
                <FontAwesomeIcon :icon="faArrowLeft" size="sm" />
              </button>
              <span>{{ email }}</span>
            </div>
          </template>
          <SignInMethodForm v-if="phase === SignInPhase.Method" @signin-method="phase = $event === 'password' ? SignInPhase.Password : SignInPhase.Pin" />
          <SignInPasswordForm v-if="phase === SignInPhase.Password" :email="email" @back="phase = SignInPhase.Method" />
          <template v-if="phase === SignInPhase.Pin">
            <span class="mt-4 title mx-auto">Entrada com pin</span>
            <span class="text-center text-sm">Será enviado uma mensagem com o código de autenticação para o celular e endereço de e-mail cadastrado.</span>
            <button type="button" class="mt-4 w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm" @click="phase = SignInPhase.WaitingPin">
              <FontAwesomeIcon :icon="faEnvelope" size="lg" />
              Receber o PIN
            </button>
            <span class="font-extralight text-xs text-[var(--info)] hover:underline cursor-pointer" @click="phase = SignInPhase.Method">Usar outra forma de entrada</span>
          </template>
          <template v-if="phase === SignInPhase.WaitingPin">
            <span class="mt-4 title mx-auto">Confirme o PIN</span>
            <span class="text-center text-sm">Para continuar, informe o código de acesso enviado para o celular <strong>(61) *****2769</strong> e para o e-mail <strong>paulor******@gmail.com</strong>.</span>
            <div class="max-w-[250px] w-full mx-auto relative flex items-center">
              <input id="pin" type="number" name="pin" maxlength="6" max="999999" pattern="[0-9]{4,6}" autocomplete="off" class="uppercase block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-600 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:pl-9 sm:text-sm/6" placeholder="Digite o PIN recebido">
              <FontAwesomeIcon :icon="faTh" size="sm" class="absolute pointer-events-none top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            </div>
            <button type="button" class="mt-4 w-full md:w-40 flex items-center justify-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold shadow-sm" @click="$router.push({ name: 'home' })">
              Confirmar
              <FontAwesomeIcon :icon="faArrowRight" size="lg" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SignInMethodForm from '@/components/SignInMethodForm.vue'
import SignInPasswordForm from '@/components/SignInPasswordForm.vue'
import ValidateEmailForm from '@/components/ValidateEmailForm.vue'
import { useApp } from '@/composables/useApp'
import { faArrowLeft, faArrowRight, faCircle, faEnvelope, faTh, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

enum SignInPhase {
  Username = 'username',
  Method = 'method',
  Password = 'password',
  Pin = 'pin',
  WaitingPin = 'waiting-pin'
}

const router = useRouter()
const { cadastraEmail } = useApp()
const phase = ref<SignInPhase>(SignInPhase.Username)
const email = ref('')

const emailVerifiedHandler = (payload: { email: string, exists: boolean }) => {
  email.value = payload.email
  if (payload.exists) {
    phase.value = SignInPhase.Method
  }
  else {
    cadastraEmail.value = payload.email
    router.push({ name: 'cadastro-anunciante' })
  }
}
</script>

<style lang="css" scoped>
.opt-divider {
  @apply w-60 flex flex-1 flex-nowrap justify-center items-center h-[1rem] leading-[1rem] text-xs text-[var(--grey-600)];
}

.opt-divider-content {
  flex: 0 auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 1rem
}

.opt-divider:after,
.opt-divider:before {
  content: "";
  display: block;
  flex: 1;
  height: 1px;
  border-bottom: 1px dashed var(--grey-400)
}
</style>
