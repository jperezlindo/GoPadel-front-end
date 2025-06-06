import { createRouter, createWebHistory } from 'vue-router'

// Layout persistente
import UserLayout from '@/layouts/UserLayout.vue'

// Rutas públicas (sin layout)
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

// Vistas con menú fijo
import Home from '@/views/Home.vue'
import User from '@/views/User.vue'
import Category from '@/views/Category.vue'
import IndexTournament from '@/views/tournament/IndexTournament.vue'
import CreateTournament from '@/views/tournament/CreateTournament.vue'
import EditTournament from '@/views/tournament/EditTournament.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'


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
      { path: 'users', name: 'IndexUsers', component: User },
      { path: 'categories', name: 'IndexCategories', component: Category },
      { path: 'tournaments', name: 'IndexTournament', component: IndexTournament },
      { path: 'tournaments/create', name: 'CreateTournament', component: CreateTournament },
      { path: 'tournaments/:id/edit', name: 'EditTournament', component: EditTournament, props: true },
      { path: 'tournaments/:id/show', name: 'ShowTournament', component: ShowTournament, props: true },

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
