<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">
      Detalles del Usuario ({{ roleLabel(user.rol_id) }})
    </h2>

    <div class="flex items-center space-x-4 mb-6">
      <img
        v-if="user.avatar"
        :src="user.avatar"
        alt="Foto de perfil"
        class="w-24 h-24 rounded-full object-cover border"
      />
      <div class="space-y-1">
        <p>
          <span class="font-semibold">Nombre: </span>
          {{ user.name }} {{ user.last_name }}
        </p>
        <p>
          <span class="font-semibold">Email: </span>
          {{ user.email }}
        </p>
        <p>
          <span class="font-semibold">WhatsApp: </span>
          {{ user.whatsapp || 'No informado' }}
        </p>
        <p>
          <span class="font-semibold">Estado: </span>
          <span :class="user.isActive ? 'text-green-600' : 'text-red-600'">
            {{ user.isActive ? 'Activo' : 'Inactivo' }}
          </span>
        </p>
      </div>
    </div>

    <!-- Acciones opcionales -->
    <div v-if="editable" class="flex justify-end gap-3">
      <button
        class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        @click="handleCancel"
      >
        Cancelar
      </button>
      <button
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        @click="handleConfirm"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserFront } from '@/services/userApi'

type Props = {
  // Acepta un UserFront y opcionalmente whatsapp si existiera en tu back
  user: UserFront & { whatsapp?: string }
  editable?: boolean
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  isEditMode: false,
})

const emit = defineEmits<{
  (e: 'detailsConfirm'): void
  (e: 'cancel'): void
}>()

// Mapeo de roles
const ROLE_MAP: Record<number, 'ADMIN' | 'EMPLOYEE' | 'PLAYER'> = {
  1: 'ADMIN',
  2: 'EMPLOYEE',
  3: 'PLAYER',
}

const roleLabel = (rolId: number | null | undefined) => ROLE_MAP[Number(rolId)] ?? '—'

const handleConfirm = () => emit('detailsConfirm')
const handleCancel = () => emit('cancel')

// Exponer user para el template
const { user, editable } = props
</script>

<style scoped></style>
