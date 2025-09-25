<!-- src/layouts/GenericLayout.vue -->
<template>
  <!-- La key fuerza remount cuando cambia el rol -->
  <component :is="layoutComponent" :key="layoutKey">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Mantengo refs a stores “por si acaso” (hidrataciones futuras, etc.),
 * sin usarlas directamente para evitar acoplar la lógica de layout aquí.
 */
import { useUserStore } from '@/stores/useUserStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

import UserLayout from '@/layouts/UserLayout.vue'
import PlayerLayout from '@/layouts/PlayerLayout.vue'

const auth = useAuthStore()
const _userStore = useUserStore()
const _playerStore = usePlayerStore()

/**
 * Reglas de negocio (FUENTE DE VERDAD: helpers del auth store).
 * - PLAYER  => rol_id = 3  => PlayerLayout
 * - EMPLOYEE => rol_id = 2 => UserLayout
 * - ADMIN   => rol_id = 1  => UserLayout
 *
 * Si por algún motivo los helpers no existieran/cambiaran, dejamos
 * un fallback por nombre/ID para robustez.
 */
const isPlayer = computed<boolean>(() => {
  // Preferimos helpers del store (single source of truth)
  if (typeof auth.isPlayer === 'function') return auth.isPlayer()

  const u = auth.user as { rol_id?: number | null; rol?: { name?: string | null } | null } | null
  const byId = (u?.rol_id ?? null) === 3
  const byName = (u?.rol?.name ?? '').toUpperCase() === 'PLAYER'
  return byId || byName
})

const isBackoffice = computed<boolean>(() => {
  if (typeof auth.isAdmin === 'function' && typeof auth.isEmployee === 'function') {
    return auth.isAdmin() || auth.isEmployee() // ADMIN (1) o EMPLOYEE (2)
  }
  const u = auth.user as { rol_id?: number | null; rol?: { name?: string | null } | null } | null
  const id = u?.rol_id ?? null
  const name = (u?.rol?.name ?? '').toUpperCase()
  return id === 1 || id === 2 || name === 'ADMIN' || name === 'EMPLOYEE'
})

/** Selección de layout */
const layoutComponent = computed<Component>(() => {
  if (isPlayer.value) return PlayerLayout
  if (isBackoffice.value) return UserLayout
  // Fallback seguro mientras se hidrata el usuario/rol
  return UserLayout
})

/** key derivada para forzar remount al cambiar de layout (evita “quedarse pegado”) */
const layoutKey = computed<string>(() => (isPlayer.value ? 'player-layout' : 'user-layout'))
</script>
