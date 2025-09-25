// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'

import './assets/tailwind.css'

// Auth / API
import { setAuthToken } from '@/utils/handleApi'
import { useAuthStore } from '@/stores/useAuthStore'

// Reinyecto access_token (si existía) en Axios antes de iniciar la app
const savedToken = localStorage.getItem('access_token')
if (savedToken) {
  setAuthToken(savedToken)
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

/**
 * Bootstrap de sesión ANTES de montar la app.
 * - Pasamos la instancia de pinia al store cuando se usa fuera de un componente.
 * - Esperamos a que el router esté listo para evitar flicker.
 */
async function start() {
  const auth = useAuthStore(pinia)

  try {
    await auth.bootstrap()
  } catch {
    // noop: si falla, el guard del router pedirá login si hace falta
  }

  // Evita flicker de rutas iniciales
  await router.isReady()

  app.mount('#app')
}

start()
