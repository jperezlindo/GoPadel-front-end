<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Jugadores</h2>
      <!-- <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Jugador</button> -->
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div class="col-span-1 md:col-span-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar por nickname…"
          class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div class="col-span-1">
        <select
          v-model="statusFilter"
          class="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <ListTable :columns="columns" :data="filteredData">
      <template #actions="{ row }">
        <div class="flex items-center gap-3">
          <button @click="viewPlayer(row)" class="text-green-600 hover:underline">Ver</button>
          <button @click="editPlayer(row.id)" class="text-blue-600 hover:underline">Editar</button>
          <button
            @click="toggleActive(row)"
            :class="row.isActive ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'"
          >
            {{ row.isActive ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </template>
    </ListTable>

    <!-- Footer con conteos -->
    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-3">
      <span>Total: {{ tableData.length }}</span>
      <span>• Activos: {{ activeCount }}</span>
      <span>• Inactivos: {{ inactiveCount }}</span>
      <button
        v-if="searchTerm || statusFilter !== 'all'"
        @click="clearFilters"
        class="ml-auto underline text-gray-700 hover:text-black"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowPlayer :user="user" :player="selectedPlayer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts.js'

import ListTable from '@/components/ListTable.vue'
import ShowPlayer from '@/views/player/showPlayer.vue'

import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUserStore } from '@/stores/useUserStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const router = useRouter()
const playerStore = usePlayerStore()
const userStore = useUserStore()
const categoryStore = useCategoryStore()

const showModal = ref(false)
const selectedPlayer = ref(null)
const user = ref(null)

const searchTerm = ref('')
const statusFilter = ref('all') // all | active | inactive

// columnas visibles en la tabla
const columns = [
  { label: 'Nickname', field: 'nickname' },
  { label: 'Posición', field: 'position' },
  { label: 'Categoría', field: 'category_name' },
]

// base de datos derivada para la tabla (desde el store)
const tableData = computed(() =>
  playerStore.players.map(p => ({
    ...p,
    category_name: categoryStore.getCategoryById?.(Number(p.category_id))?.name ?? '-',
  })),
)

// conteos (usando isActive)
const activeCount = computed(() => tableData.value.filter(p => !!p.isActive).length)
const inactiveCount = computed(() => tableData.value.filter(p => !p.isActive).length)

// filtros (nickname + estado) usando isActive
const filteredData = computed(() => {
  const term = (searchTerm.value ?? '').trim().toLowerCase()
  const byName = term
    ? tableData.value.filter(p => String(p.nickname ?? '').toLowerCase().includes(term))
    : tableData.value

  if (statusFilter.value === 'active') return byName.filter(p => !!p.isActive)
  if (statusFilter.value === 'inactive') return byName.filter(p => !p.isActive)
  return byName
})

onMounted(async () => {
  if (!playerStore.players?.length && playerStore.fetchPlayers) {
    await playerStore.fetchPlayers()
  }
  if (!categoryStore.categories?.length && categoryStore.fetchCategories) {
    await categoryStore.fetchCategories()
  }
  if (!userStore.users?.length && userStore.fetchUsers) {
    await userStore.fetchUsers()
  }
})

const clearFilters = () => {
  searchTerm.value = ''
  statusFilter.value = 'all'
}

const goToCreate = () => {
  router.push({ name: 'CreatePlayer' })
}

const editPlayer = (id) => {
  router.push({ name: 'EditPlayer', params: { id } })
}

const viewPlayer = (row) => {
  const p = playerStore.getPlayerById?.(Number(row.id)) ?? row
  selectedPlayer.value = {
    ...p,
    category: categoryStore.getCategoryById?.(Number(p.category_id))?.name ?? '-',
  }
  user.value = userStore.getUserById?.(Number(p.user_id)) ?? null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPlayer.value = null
  user.value = null
}

/**
 * Activa/desactiva un player (isActive) con confirmación.
 * Usa playerStore.toggleActive/activatePlayer/deactivatePlayer.
 */
const toggleActive = async (row) => {
  const nextState = !row.isActive
  const actionText = nextState ? 'activar' : 'desactivar'

  const result = await Swal.fire({
    title: `¿Confirmar ${actionText}?`,
    text: `Vas a ${actionText} el jugador "${row.nickname ?? row.id}".`,
    icon: 'question',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    confirmButtonText: `Sí, ${actionText}`,
    // reverseButtons: true,
  })
  if (!result.isConfirmed) return

  try {
    const updater =
      playerStore.toggleActive ??
      (nextState ? playerStore.activatePlayer : playerStore.deactivatePlayer)

    if (!updater) {
      throw new Error('No hay acción de toggle/activate/deactivate en el store.')
    }

    await updater(row.id, nextState)

    // refresco opcional si tu store ya muta el estado:
    await playerStore.fetchPlayers()

    showToast({
        type: 'success',
        message: `Jugador ${nextState ? 'activado' : 'desactivado'} correctamente.`,
    })
  } catch (err) {
    await Swal.fire({
      title: 'Error',
      text: 'No se pudo cambiar el estado. Revisá la consola o reintenta.',
      icon: 'error',
    })
  }
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
