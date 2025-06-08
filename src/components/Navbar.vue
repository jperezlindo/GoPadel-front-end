<template>
    <nav class="bg-white shadow-md px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <!-- Izquierda: Logo -->
            <router-link :to="{ name: 'Home' }" class="text-xl font-bold text-blue-600">
                GoPadel
            </router-link>

            <!-- Centro: Menú (visible en md+) -->
            <ul class="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                <li><router-link :to="{ name: 'Home' }" class="nav-link">Inicio</router-link></li>
                <li><router-link :to="{ name: 'IndexTournament' }" class="nav-link">Torneos</router-link></li>
                <li><router-link :to="{ name: '' }" class="nav-link">Jugadores</router-link></li>
                <li><router-link :to="{ name: 'IndexCategory' }" class="nav-link">Categorías</router-link></li>
                <li><router-link :to="{ name: 'IndexUser' }" class="nav-link">Usuarios</router-link></li>
            </ul>

            <!-- Derecha: usuario logueado -->
            <div class="hidden md:flex items-center gap-3">
                <span class="text-sm text-gray-700">{{ user.name }}</span>
                <img :src="user.avatar" alt="avatar" class="w-9 h-9 rounded-full object-cover border border-gray-300" />
            </div>

            <!-- Botón hamburguesa (solo mobile) -->
            <button @click="isOpen = !isOpen" class="md:hidden text-gray-600 focus:outline-none">
                <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Menú Mobile -->
        <div v-if="isOpen" class="md:hidden mt-3 border-t pt-3 space-y-2">
            <ul class="space-y-2 text-sm text-gray-700 font-medium">
                <li><router-link :to="{ name: 'Home' }" class="nav-link">Inicio</router-link></li>
                <li><router-link :to="{ name: 'IndexTournament' }" class="nav-link">Torneos</router-link></li>
                <li><router-link :to="{ name: '' }" class="nav-link">Jugadores</router-link></li>
                <li><router-link :to="{ name: 'IndexCategory' }" class="nav-link">Categorías</router-link></li>
                <li><router-link :to="{ name: 'IndexUser' }" class="nav-link">Usuarios</router-link></li>
            </ul>

            <!-- Usuario mobile -->
            <div class="flex items-center gap-3 pt-3 border-t">
                <span class="text-sm text-gray-700">{{ user.name }}</span>
                <img :src="user.avatar" alt="avatar" class="w-9 h-9 rounded-full object-cover border border-gray-300" />
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const user = {
    name: 'Juan Pérez',
    avatar: 'https://i.pravatar.cc/100?img=3'
}
</script>

<style scoped>
.nav-link {
    @apply hover:text-blue-600 transition;
}
</style>
