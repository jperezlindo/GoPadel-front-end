<!-- PlayerNavbar.vue -->
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
          <img
            :src="avatarSrc"
            alt="avatar"
            class="w-8 h-8 rounded-full object-cover border"
            @error="onImgError"
          />
          <span class="text-sm text-gray-700">{{ userName }}</span>
        </button>

        <div v-if="showMenu" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
          <router-link
            v-if="user?.id"
            :to="{ name: 'EditUser', params: { id: user.id } }"
            class="block px-4 py-2 hover:bg-gray-100 text-sm"
            @click="showMenu = false"
          >
            Datos Personales
          </router-link>
          <router-link
            v-if="player?.id"
            :to="{ name: 'EditPlayer', params: { id: player.id } }"
            class="block px-4 py-2 hover:bg-gray-100 text-sm"
            @click="showMenu = false"
          >
            Datos Jugador
          </router-link>
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            @click="openChangePwd"
          >
            Cambiar contraseña
          </button>
          <button
            @click="() => { showMenu = false; logout(); }"
            class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <!-- Botón mobile -->
      <div class="md:hidden flex items-center gap-2">
        <span class="text-sm text-gray-700">{{ userName }}</span>
        <button @click="toggleMobileMenu" class="flex items-center">
          <img
            :src="avatarSrc"
            alt="avatar"
            class="w-8 h-8 rounded-full object-cover border mr-2"
            @error="onImgError"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
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
        <button class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" @click="openChangePwdFromMobile">
          Cambiar contraseña
        </button>
        <button
          @click="() => { showMobileMenu = false; logout(); }"
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>

    <!-- Modal de cambio de contraseña -->
    <ChangePasswordModal
      v-model="showChangePwd"
      :user-id="user?.id || 0"
      :require-old="true"
      @changed="onPasswordChanged"
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import PlayerMenu from '@/components/PlayerMenu.vue'
import defaultAvatar from '@/assets/avatar-default.png'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import { showToast } from '@/utils/alerts'

type MaybeEl = HTMLElement | null

const router = useRouter()

const showMenu = ref<boolean>(false)
const showMobileMenu = ref<boolean>(false)
const navbarRef: Ref<MaybeEl> = ref(null)

const authStore = useAuthStore()

type AuthUser = { id?: number; name?: string; avatar?: string | null } | null
type AuthPlayer = { id?: number } | null

const user = computed<AuthUser>(() => authStore.user as AuthUser)
const player = computed<AuthPlayer>(() => authStore.player as AuthPlayer)
const userName = computed(() => user.value?.name ?? 'Jugador')

const avatarSrc = computed(() => {
  const src = (user.value?.avatar ?? '').trim()
  return src ? src : defaultAvatar
})

const toggleMenu = () => { showMenu.value = !showMenu.value }
const toggleMobileMenu = () => { showMobileMenu.value = !showMobileMenu.value }

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img && img.src !== defaultAvatar) img.src = defaultAvatar
}

// Modal
const showChangePwd = ref<boolean>(false)
const openChangePwd = () => { showMenu.value = false; showChangePwd.value = true }
const openChangePwdFromMobile = () => { showMobileMenu.value = false; showChangePwd.value = true }

const onPasswordChanged = async () => {
  try {
    await authStore.signOut()
  } finally {
    showToast({ type: 'success', message: 'Contraseña actualizada. Volvé a iniciar sesión.' })
    router.push({ name: 'Login' })
  }
}

const logout = async () => {
  try { await authStore.signOut() } finally { router.push({ name: 'Login' }) }
}

// Click afuera
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node | null
  if (navbarRef.value && target && !navbarRef.value.contains(target)) {
    showMenu.value = false
    showMobileMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
