<template>
    <nav class="bg-white shadow-md px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <!-- Logo -->
            <router-link :to="{ name: 'Home' }" class="text-xl font-bold text-blue-600">
                GoPadel
            </router-link>

            <!-- Menú principal -->
             <ul class="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                <UserMenu />
             </ul>

            <!-- Usuario PC con dropdown -->
            <div class="hidden md:flex items-center gap-3 relative" ref="dropdownRef">
                <button @click="toggleDropdown" class="flex items-center gap-2 focus:outline-none">
                    <span class="text-sm text-gray-700">{{ user.name }}</span>
                    <img :src="user.avatar" alt="avatar"
                        class="w-9 h-9 rounded-full object-cover border border-gray-300" />
                </button>

                <div v-if="showDropdown"
                    class="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                    <ul class="text-sm text-gray-700 py-2">
                        <li>
                            <router-link :to="''" class="block px-4 py-2 hover:bg-gray-100" @click="showDropdown = false">
                                Modificar datos
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="''" class="block px-4 py-2 hover:bg-gray-100" @click="showDropdown = false">
                                Cambiar contraseña
                            </router-link>
                        </li>
                        <li>
                            <button @click="() => { showDropdown = false; logout(); }" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Botón mobile -->
            <div class="md:hidden flex items-center gap-2">
                <button @click="isOpen = !isOpen" class="md:hidden text-gray-600 focus:outline-none flex items-center gap-2">
                    <span class="text-sm text-gray-700">{{ user.name }}</span>
                    <img :src="user.avatar" alt="avatar"
                        class="w-9 h-9 rounded-full object-cover border border-gray-300" />
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
        </div>

        <!-- Menú mobile -->
        <div v-if="isOpen" class="md:hidden mt-3 space-y-2 list-none">
            <UserMenu @menu-action="isOpen = false" />
            <div class="bg-white border rounded-lg shadow-md p-2 flex flex-col gap-2">
                <router-link :to="''" class="block px-4 py-2 hover:bg-gray-100" @click="isOpen = false">
                    Modificar datos
                </router-link>
                <router-link :to="''" class="block px-4 py-2 hover:bg-gray-100" @click="isOpen = false">
                    Cambiar contraseña
                </router-link>
                <button @click="() => { isOpen = false; logout(); }" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Cerrar sesión
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

import UserMenu from '@/components/UserMenu.vue'

import { useUserStore } from '@/stores/useUserStore'
import { useAuthStore } from '@/stores/useAuthStore'


const isOpen = ref(false)
const showDropdown = ref(false)
const dropdownRef = ref(null)
const router = useRouter()

const userStore = useUserStore()
const authStore = useAuthStore()

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        showDropdown.value = false
    }
}

const user = computed(() => authStore.user)

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

const logout = () => {
    console.log('Cerrando sesión...')
    router.push({ name: 'Login' })
}

</script>

<style scoped>
.nav-link {
    @apply hover:text-blue-600 transition;
}
</style>
