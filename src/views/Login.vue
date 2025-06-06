<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h1 class="text-2xl font-semibold text-center mb-6">Iniciar Sesión</h1>
            <form @submit.prevent="login">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" v-model="email" required
                        class="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input type="password" v-model="password" required
                        class="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const login = () => {
    console.log('Email:', email.value)
    console.log('Password:', password.value)
    // Aquí iría tu lógica de login (API, Pinia, etc.)
}
</script>
