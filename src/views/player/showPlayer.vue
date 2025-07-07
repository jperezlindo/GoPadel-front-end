<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">Detalles del Jugador</h2>

    <div class="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
      <img
        v-if="user?.avatar"
        :src="user.avatar"
        :alt="user?.name ? 'Foto de perfil de ' + user.name + ' ' + user.lastname : 'Foto de perfil'"
        class="w-24 h-24 rounded-full object-cover border"
        aria-label="Foto de perfil"
      />
      <div>
        <p><span class="font-semibold">Nombre: </span> {{ user?.name || 'No informado' }} {{ user?.lastname || '' }}</p>
        <p><span class="font-semibold">Email: </span> {{ user?.email || 'No informado' }}</p>
        <p><span class="font-semibold">WhatsApp: </span> {{ user?.whatsapp || 'No informado' }}</p>
        <p><span class="font-semibold">Nickname: </span> {{ player?.nickname || 'No informado' }}</p>
        <p><span class="font-semibold">Posición: </span> {{ player?.position || 'No informado' }}</p>
        <p><span class="font-semibold">Categoría: </span> {{ player?.category || (player?.category_id ? player?.category_id + 'a' : 'No informado') }}</p>
        <p><span class="font-semibold">Level: </span> {{ player?.level ?? 'No informado' }}</p>
        <p><span class="font-semibold">Puntos: </span> {{ player?.points ?? 'No informado' }}</p>
        <p>
          <span class="font-semibold">Estado: </span>
          <span :class="player?.isActive ? 'text-green-600' : 'text-red-600'">
            {{ player?.isActive ? 'Activo' : 'Inactivo' }}
          </span>
        </p>
        <p><span class="font-semibold">Partner:</span> {{ player?.partner || 'No informado'}}</p>
      </div>
    </div>
    <button @click="goHome" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full sm:w-auto" aria-label="Volver al inicio">
      Volver
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: '',
      lastname: '',
      email: '',
      whatsapp: '',
      isActive: false,
    }),
  },
  player: {
    type: Object,
    default: () => ({
      nickname: '',
      position: '',
      category: '',
      level: null,
      points: null,
      partner: '',
      isActive: true,
    }),
  },
})
</script>