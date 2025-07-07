<template>
    <nav class="bg-white shadow-md px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between" ref="navbarRef">
            <!-- Logo -->
            <router-link :to="{ name: 'Home' }" class="text-xl font-bold text-blue-600">
                GoPadel
            </router-link>

            <!-- Menú Desktop -->
            <ul class="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                <PlayerMenu />
            </ul>

            <!-- Usuario + Dropdown Desktop -->
            <div class="relative hidden md:block">
                <button @click="toggleMenu" class="flex items-center space-x-2">
                    <img :src="user?.avatar" alt="avatar" class="w-8 h-8 rounded-full object-cover border" />
                    <span class="text-sm text-gray-700">{{ user?.name }}</span>
                </button>

                <div v-if="showMenu" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
                    <router-link
                        v-if="user?.id" 
                        :to="{ name: 'EditUser', params: { id: user.id } }"
                        class="block px-4 py-2 hover:bg-gray-100 text-sm"
                        @click="showMenu = false"
                    >
                        Editar Usuario
                    </router-link>
                    <router-link
                        v-if="player?.id"
                        :to="{ name: 'EditPlayer', params: { id: player.id } }"
                        class="block px-4 py-2 hover:bg-gray-100 text-sm"
                        @click="showMenu = false"
                    >
                        Editar Jugador
                    </router-link>
                    <button @click="() => { showMenu = false; logout(); }" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Cerrar sesión</button>
                </div>
            </div>

            <!-- Botón mobile -->
            <div class="md:hidden flex items-center gap-2">
                <span class="text-sm text-gray-700">{{ user.name }}</span>
                <button @click="toggleMobileMenu" class="flex items-center">
                    <img :src="user?.avatar" alt="avatar" class="w-8 h-8 rounded-full object-cover border mr-2" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Menú mobile -->
        <div v-if="showMobileMenu" class="md:hidden mt-3 space-y-2 list-none">
            <PlayerMenu @menu-action="showMobileMenu = false" />
            <div class="bg-white border rounded-lg shadow-md p-2 flex flex-col gap-2">
                <router-link
                    v-if="user?.id" 
                    :to="{ name: 'EditUser', params: { id: user.id } }"
                    class="block px-4 py-2 hover:bg-gray-100 text-sm"
                    @click="showMobileMenu = false"
                >
                    Editar Usuario
                </router-link>
                <router-link
                    v-if="player?.id"
                    :to="{ name: 'EditPlayer', params: { id: player.id } }"
                    class="block px-4 py-2 hover:bg-gray-100 text-sm"
                    @click="showMobileMenu = false"
                >
                    Editar Jugador
                </router-link>
                <button @click="() => { showMobileMenu = false; logout(); }" class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Cerrar sesión</button>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/useAuthStore'

import PlayerMenu from '@/components/PlayerMenu.vue'

const router = useRouter()
const showMenu = ref(false)
const showMobileMenu = ref(false)
const navbarRef = ref(null)

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const player = computed(() => authStore.player)

const toggleMenu = () => {
    showMenu.value = !showMenu.value
}

const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
}

const logout = () => {
    router.push({ name: 'Login' })
}

// Cerrar menús si se hace clic fuera del navbar
const handleClickOutside = (e) => {
    if (navbarRef.value && !navbarRef.value.contains(e.target)) {
        showMenu.value = false
        showMobileMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

</script>
