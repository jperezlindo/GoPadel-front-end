import { createRouter, createWebHistory } from 'vue-router'

// Layout persistente
import UserLayout from '@/layouts/UserLayout.vue'

// Rutas públicas (sin layout)
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

// Vistas con menú fijo
import Home from '@/views/Home.vue'

import IndexUser from '@/views/user/IndexUser.vue'
import CreateUser from '@/views/user/CreateUser.vue'
import EditUser from '@/views/user/EditUser.vue'

import IndexCategory from '@/views/category/IndexCategory.vue'
import CreateCategory from '@/views/category/CreateCategory.vue'
import EditCategory from '@/views/category/EditCategory.vue'

import IndexTournament from '@/views/tournament/IndexTournament.vue'
import CreateTournament from '@/views/tournament/CreateTournament.vue'
import EditTournament from '@/views/tournament/EditTournament.vue'


const routes = [
  // Rutas públicas fuera del layout
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // Rutas con layout persistente
  {
    path: '/',
    component: UserLayout,
    children: [
      { path: 'home', name: 'Home', component: Home },
      { path: 'users', name: 'IndexUser', component: IndexUser },
      { path: 'users/create', name: 'CreateUser', component: CreateUser },
      { path: 'users/edit/:id', name: 'EditUser', component: EditUser },
      { path: 'categories', name: 'IndexCategory', component: IndexCategory },
      { path: 'categories/create', name: 'CreateCategory', component: CreateCategory },
      { path: 'categories/edit/:id', name: 'EditCategory', component: EditCategory },
      { path: 'tournaments', name: 'IndexTournament', component: IndexTournament },
      { path: 'tournaments/create', name: 'CreateTournament', component: CreateTournament },
      { path: 'tournaments/edit/:id', name: 'EditTournament', component: EditTournament },

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
