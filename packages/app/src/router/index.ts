import type { Component } from 'vue'
import HomeView from '@/views/HomeView.vue'
import Identificacao from '@/views/Identificacao.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView as Component
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
      component: async () => import('@/views/MinhaConta.vue') as Component
    },
    {
      path: '/meus-dados',
      name: 'meus-dados',
      component: async () => import('@/views/MeusDados.vue') as Component
    },
    {
      path: '/alterar-senha',
      name: 'alterar-senha',
      component: async () => import('@/views/AlterarSenha.vue') as Component
    },
    {
      path: '/institucional',
      name: 'institucional',
      component: async () => import('@/views/Institucional.vue') as Component
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
