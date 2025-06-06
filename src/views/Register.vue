<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h1 class="text-2xl font-semibold text-center mb-6">Registrarse</h1>
            <form @submit.prevent="register">
                <div class="mb-4">
                    <label>Nombre</label>
                    <input v-model="nombre" type="text" required class="input" />
                </div>
                <div class="mb-4">
                    <label>Apellido</label>
                    <input v-model="apellido" type="text" required class="input" />
                </div>
                <div class="mb-4">
                    <label>Fecha de Nacimiento</label>
                    <input v-model="fechaNacimiento" type="date" required class="input" />
                </div>
                <div class="mb-4">
                    <label>Email</label>
                    <input v-model="email" type="email" required class="input" />
                </div>
                <div class="mb-4">
                    <label>Celular</label>
                    <input v-model="celular" type="tel" required class="input" />
                </div>
                <div class="mb-6">
                    <label>Contraseña</label>
                    <input v-model="password" type="password" required class="input" />
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Registrarse
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const apellido = ref('')
const fechaNacimiento = ref('')
const email = ref('')
const celular = ref('')
const password = ref('')

const register = () => {
    console.log({
        nombre: nombre.value,
        apellido: apellido.value,
        fechaNacimiento: fechaNacimiento.value,
        email: email.value,
        celular: celular.value,
        password: password.value
    })
    // Aquí iría tu lógica para enviar los datos al backend
}
</script>

<style scoped>
    .input {
        @apply mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400;
    }

    .label {
        @apply block text-sm font-medium text-gray-700;
    }
</style>
