<!-- Register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-xl">
      <div class="bg-white shadow-xl rounded-2xl p-8">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Crear cuenta (Jugador)
        </h1>

        <form @submit.prevent="onSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="name" v-model.trim="form.name" type="text" required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Apellido -->
          <div>
            <label for="last_name" class="block text-sm font-medium text-gray-700">Apellido</label>
            <input id="last_name" v-model.trim="form.last_name" type="text" required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Email -->
          <div class="md:col-span-2">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Fecha de nacimiento (opcional) -->
          <div>
            <label for="birth_day" class="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <input id="birth_day" v-model="form.birth_day" type="date"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Avatar URL (opcional) -->
          <div>
            <label for="avatar" class="block text-sm font-medium text-gray-700">Avatar (URL)</label>
            <input id="avatar" v-model.trim="form.avatar" type="url" placeholder="https://..."
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input id="password" v-model="form.password" :type="showPass ? 'text' : 'password'"
              autocomplete="new-password" required minlength="6"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="auth.loading" />
          </div>

          <!-- Confirm -->
          <div>
            <label for="password2" class="block text-sm font-medium text-gray-700">Repetir contraseña</label>
            <div class="mt-1 relative">
              <input id="password2" v-model="form.password2" :type="showPass ? 'text' : 'password'"
                autocomplete="new-password" required minlength="6"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :disabled="auth.loading" />
              <button type="button" class="absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700"
                @click="showPass = !showPass" :aria-label="showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :disabled="auth.loading">
                {{ showPass ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <!-- Error inline -->
          <p v-if="inlineError" class="md:col-span-2 text-sm text-red-600">
            {{ inlineError }}
          </p>

          <!-- Submit -->
          <div class="md:col-span-2">
            <button type="submit"
              class="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              :disabled="auth.loading">
              <span v-if="!auth.loading">Crear cuenta</span>
              <span v-else>Creando…</span>
            </button>
          </div>

          <div class="md:col-span-2 text-center text-sm text-gray-600 mt-2">
            ¿Ya tenés cuenta?
            <RouterLink :to="{ name: 'Login' }" class="text-indigo-600 hover:underline">Iniciar sesión</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/alerts'
import { registerPlayer, type RegisterPayload } from '@/utils/authApi'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// constantes (opcional: facility por defecto si querés asignarlo)
const FACILITY_DEFAULT: number | null = 1

type RegisterForm = {
  name: string
  last_name: string
  email: string
  birth_day: string | null
  avatar: string
  password: string
  password2: string
}

const form = reactive<RegisterForm>({
  name: '',
  last_name: '',
  email: '',
  birth_day: null,
  avatar: '',
  password: '',
  password2: '',
})

const showPass = ref(false)
const inlineError = ref<string | null>(null)

const onSubmit = async () => {
  inlineError.value = null

  // Validaciones mínimas
  if (!form.name || !form.last_name) {
    inlineError.value = 'Completá nombre y apellido.'
    return
  }
  if (!form.email || !form.password) {
    inlineError.value = 'Completá email y contraseña.'
    return
  }
  if (form.password !== form.password2) {
    inlineError.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    // payload para endpoint público /api/v1/auth/register (rol PLAYER forzado en backend)
    const payload: RegisterPayload = {
      name: form.name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      birth_day: form.birth_day && form.birth_day.length ? form.birth_day : null,
      avatar: form.avatar || null,
      facility_id: FACILITY_DEFAULT, // opcional (podés quitarlo si no corresponde)
      city_id: null,
      is_active: true,
    }

    // 1) Registrar
    const res = await registerPlayer(payload)
    // res puede venir como { success, message, data }, pero no lo necesitamos acá

    // 2) Login automático
    await auth.signIn({ email: form.email, password: form.password })

    showToast({ type: 'success', message: `¡Bienvenido, ${form.name}!` })

    // 3) Redirigir (respeta ?next=)
    const next = (route.query.next as string) || '/home'
    router.replace(next)
  } catch (e: any) {
    const msg = e?.message || 'No se pudo crear la cuenta'
    inlineError.value = msg
    showToast({ type: 'error', message: msg })
  }
}
</script>
