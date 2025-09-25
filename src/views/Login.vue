<!-- Login.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div class="w-full max-w-md">
            <div class="bg-white shadow-xl rounded-2xl p-8">
                <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Iniciar sesión</h1>

                <form @submit.prevent="onSubmit" class="space-y-4">
                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" v-model.trim="form.email" type="email" autocomplete="email" required
                            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            :disabled="auth.loading" />
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                        <div class="mt-1 relative">
                            <input id="password" :type="showPass ? 'text' : 'password'" v-model="form.password"
                                autocomplete="current-password" required
                                class="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                :disabled="auth.loading" />
                            <button type="button"
                                class="absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700"
                                @click="showPass = !showPass"
                                :aria-label="showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                :disabled="auth.loading">
                                {{ showPass ? 'Ocultar' : 'Mostrar' }}
                            </button>
                        </div>
                    </div>

                    <!-- Error inline -->
                    <p v-if="inlineError" class="text-sm text-red-600">
                        {{ inlineError }}
                    </p>

                    <!-- Submit -->
                    <button type="submit"
                        class="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                        :disabled="auth.loading">
                        <span v-if="!auth.loading">Entrar</span>
                        <span v-else>Ingresando…</span>
                    </button>
                </form>

                <div class="mt-6 text-center text-sm text-gray-600">
                    ¿No tenés cuenta?
                    <RouterLink :to="{ name: 'Register' }" class="text-indigo-600 hover:underline">
                        Registrate
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/alerts'
import type { LoginCredentials } from '@/utils/authApi' // ✅ usa utils/authApi

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive<LoginCredentials>({
    email: '',
    password: '',
})

const showPass = ref(false)
const inlineError = ref<string | null>(null)

onMounted(() => {
    // Si ya está logueado, mandamos a Home
    if (auth.isLoggedIn()) {
        router.replace({ name: 'Home' })
    }
})

const onSubmit = async () => {
    inlineError.value = null

    // Validación mínima en front
    if (!form.email || !form.password) {
        inlineError.value = 'Completá email y contraseña.'
        return
    }

    try {
        await auth.signIn({ ...form })
        showToast({ type: 'success', message: 'Bienvenido 👋' })

        // Redirección con ?next=
        const next = (route.query.next as string) || '/home'
        router.replace(next)
    } catch (e: any) {
        // signIn lanza un normalizeApiError, usamos su message si existe
        const msg = e?.message || 'No se pudo iniciar sesión'
        inlineError.value = msg
        showToast({ type: 'error', message: msg })
    }
}
</script>
