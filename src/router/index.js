import { createRouter, createWebHistory } from 'vue-router'

// Layout persistente
import GenericLayout from '@/layouts/GenericLayout.vue'

const routes = [
  // Rutas públicas fuera del layout
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },

  // Rutas con layout persistente
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    component: GenericLayout,
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/Home.vue') },
      //Users
      { path: 'users', name: 'IndexUser', component: () => import('@/views/user/IndexUser.vue') },
      { path: 'users/create', name: 'CreateUser', component: () => import('@/views/user/CreateUser.vue') },
      { path: 'users/edit/:id', name: 'EditUser', component: () => import('@/views/user/EditUser.vue') },
      // Categories
      // { path: 'categories', name: 'IndexCategory', component: () => import('@/views/category/IndexCategory.vue') },
      // { path: 'categories/create', name: 'CreateCategory', component: () => import('@/views/category/CreateCategory.vue') },
      // { path: 'categories/edit/:id', name: 'EditCategory', component: () => import('@/views/category/EditCategory.vue') },
      // Tournaments
      { path: 'tournaments', name: 'IndexTournament', component: () => import('@/views/tournament/IndexTournament.vue') },
      { path: 'tournaments/create', name: 'CreateTournament', component: () => import('@/views/tournament/CreateTournament.vue') },
      { path: 'tournaments/edit/:id', name: 'EditTournament', component: () => import('@/views/tournament/EditTournament.vue') },
      // Players
      { path: 'players', name: 'IndexPlayer', component: () => import('@/views/player/indexPlayer.vue') },
      { path: 'players/create', name: 'CreatePlayer', component: () => import('@/views/player/createPlayer.vue') },
      { path: 'players/edit/:id', name: 'EditPlayer', component: () => import('@/views/player/editPlayer.vue') },
      { path: 'players/info', name: 'InfoPlayer', component: () => import('@/views/player/infoPlayer.vue') },
      // Torneo abiertos para Jugadores
      { path: 'open-tournaments', name: 'OpenTournaments', component: () => import('@/views/tournament/OpenTournaments.vue') },
      { path: 'registration-tournament/:id', name: 'RegistrationTournament', component: () => import('@/views/registrations/RegistrationTournament.vue') }
    ]
  },
  // Ruta para manejar 404 - Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: '<div style="text-align:center;margin-top:2rem;"><h1>404 - Página no encontrada</h1><p>La ruta solicitada no existe.</p></div>'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
