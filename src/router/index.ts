// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { defineComponent, h } from 'vue'
import GenericLayout from '@/layouts/GenericLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'

// --- Rutas ---
const routes: RouteRecordRaw[] = [
  // Públicas (fuera del layout)
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue'), meta: { guestOnly: true } },

  // Redirección raíz
  { path: '/', redirect: '/home' },

  // Con layout persistente (protegidas por auth)
  {
    path: '/',
    component: GenericLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/Home.vue') },

      // Users
      { path: 'users', name: 'IndexUser', component: () => import('@/views/user/IndexUser.vue') },
      { path: 'users/create', name: 'CreateUser', component: () => import('@/views/user/CreateUser.vue') },
      { path: 'users/edit/:id', name: 'EditUser', component: () => import('@/views/user/EditUser.vue') },

      // Tournaments
      { path: 'tournaments', name: 'IndexTournament', component: () => import('@/views/tournament/IndexTournament.vue') },
      { path: 'tournaments/create', name: 'CreateTournament', component: () => import('@/views/tournament/CreateTournament.vue') },
      { path: 'tournaments/edit/:id', name: 'EditTournament', component: () => import('@/views/tournament/EditTournament.vue') },

      // Players
      { path: 'players', name: 'IndexPlayer', component: () => import('@/views/player/indexPlayer.vue') },
      { path: 'players/create', name: 'CreatePlayer', component: () => import('@/views/player/createPlayer.vue') },
      { path: 'players/edit/:id', name: 'EditPlayer', component: () => import('@/views/player/editPlayer.vue') },
      { path: 'players/info', name: 'InfoPlayer', component: () => import('@/views/player/infoPlayer.vue') },

      // Torneos abiertos para Jugadores
      { path: 'open-tournaments', name: 'OpenTournaments', component: () => import('@/views/tournament/OpenTournaments.vue') },
      { path: 'registration-tournament/:id', name: 'RegistrationTournament', component: () => import('@/views/registrations/RegistrationPlayer.vue') },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: defineComponent({
      name: 'NotFoundPage',
      setup() {
        return () =>
          h('div', { style: 'text-align:center;margin-top:2rem;' }, [
            h('h1', '404 - Página no encontrada'),
            h('p', 'La ruta solicitada no existe.'),
          ])
      },
    }),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

/**
 * Guard global (opcional y recomendado):
 * - Bloquea rutas con meta.requiresAuth si no hay sesión.
 * - Evita que usuarios logueados vayan a /login o /register.
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // si aún no hay sesión en memoria pero hay tokens en storage, inicializá
  if (!auth.user && (localStorage.getItem('access_token') || localStorage.getItem('refresh_token'))) {
    await auth.bootstrap().catch(() => {})
  }

  const loggedIn = auth.isLoggedIn()

  if (to.meta?.requiresAuth && !loggedIn) {
    return { name: 'Login', query: { next: to.fullPath } }
  }
  if (to.meta?.guestOnly && loggedIn) {
    return { name: 'Home' }
  }
  return true
})

export default router
