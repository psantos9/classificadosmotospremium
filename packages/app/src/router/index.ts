import type { Component } from 'vue'
import type { NavigationGuardWithThis } from 'vue-router'
import { useApp } from '@/composables/useApp'
import Anuncio from '@/views/Anuncio.vue'
import Anuncios from '@/views/Anuncios.vue'
import HomeView from '@/views/HomeView.vue'
import Identificacao from '@/views/Identificacao.vue'
import { unref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

export const NOVO_ANUNCIO_ID = 'novo'

const isSignedIn: NavigationGuardWithThis<any> = (to, from, next) => {
  const { signedIn } = useApp()
  if (!unref(signedIn)) {
    next({ name: 'identificacao' })
  }
  else { next() }
}

const checkIfThereAreDraftAds: NavigationGuardWithThis<any> = async (to, from, next) => {
  const { api } = useApp()
  if (to.params.adId === undefined) {
    const drafts = await api.fetchMeusAnuncios({ status: 'draft' })
    if (drafts.length > 0) {
      next({ name: 'rascunhos' })
    }
    else {
      next()
    }
  }
  const adId = Number.parseInt(to.params.adId as string)
  if (Number.isNaN(adId)) {
    next()
  }
  else {
    const ad = await api.fetchMeuAnuncio(adId)
    if (ad == null) {
      to.params.adId = 'novo'
    }
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView as Component
    },
    {
      path: '/anuncios/:q?',
      name: 'anuncios',
      component: Anuncios as Component
    },
    {
      path: '/anuncio/:id',
      name: 'anuncio',
      component: Anuncio as Component
    },
    {
      path: '/identificacao',
      name: 'identificacao',
      component: Identificacao as Component
    },
    {
      path: '/cadastro',
      name: 'cadastro-anunciante',
      component: async () => import('@/views/CadastroAnunciante.vue') as Component
    },
    {
      path: '/minha-conta',
      name: 'minha-conta',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/MinhaConta.vue') as Component
    },
    {
      path: '/meus-anuncios',
      name: 'meus-anuncios',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/MeusAnuncios.vue') as Component
    },
    {
      path: '/minhas-conversas',
      name: 'minhas-conversas',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/MinhasConversas.vue') as Component
    },
    {
      path: '/minhas-conversas/:id',
      name: 'conversa',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/Conversa.vue') as Component
    },
    {
      path: '/meus-dados',
      name: 'meus-dados',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/MeusDados.vue') as Component
    },
    {
      path: '/alterar-senha',
      name: 'alterar-senha',
      beforeEnter: [isSignedIn],
      component: async () => import('@/views/AlterarSenha.vue') as Component
    },
    {
      path: '/anuncie',
      beforeEnter: [isSignedIn],
      component: async () => import('@/layouts/CadastroAnuncio.vue') as Component,
      children: [
        {
          path: ':adId?',
          beforeEnter: [checkIfThereAreDraftAds],
          name: 'anuncie',
          component: async () => import('@/views/FormularioCadastroAnuncio.vue') as Component
        },
        {
          path: 'rascunhos',
          name: 'rascunhos',
          component: async () => import('@/views/SelecaoRascunhosAnuncio.vue') as Component
        },
        {
          path: 'planos/:adId',
          name: 'planos',
          component: async () => import('@/views/Planos.vue') as Component
        }
      ]
    },
    {
      path: '/quem-somos',
      name: 'quem-somos',
      component: async () => import('@/views/QuemSomos.vue') as Component
    },
    {
      path: '/fale-conosco',
      name: 'fale-conosco',
      component: async () => import('@/views/FaleConosco.vue') as Component
    },
    {
      path: '/perguntas-frequentes',
      name: 'perguntas-frequentes',
      component: async () => import('@/views/PerguntasFrequentes.vue') as Component
    }
  ]
})

export default router
