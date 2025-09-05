// main.js
import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router/index.js'

import './assets/tailwind.css'

// ==== NUEVO: handleApi y helpers de auth ====
import { setAuthToken, onUnauthorized } from '@/utils/handleApi'

// Si en el futuro usas JWT, aquí leemos el token guardado
const savedToken = localStorage.getItem('access_token')
if (savedToken) {
  setAuthToken(savedToken)
}

// Si en el futuro usas JWT, puedes manejar aquí redirecciones en caso de 401
onUnauthorized(() => {
  console.warn('Sesión expirada o no autorizada')
  // router.push({ name: 'login' }) // lo activas cuando tengas login
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
