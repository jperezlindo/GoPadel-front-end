<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos</h2>
      <button @click="goToCreate" class="btn-primary w-full sm:w-auto px-4">+ Nuevo Torneo</button>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input v-model="searchName" type="text" placeholder="Buscar por nombre de torneo…"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input v-model="searchFacility" type="text" placeholder="Buscar por nombre del facility…"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select v-model="statusFilter"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="all">Todos</option>
        <option value="active">Abiertos</option>
        <option value="inactive">Cerrados</option>
      </select>
    </div>

    <div v-if="tournamentStore.loading" class="py-6 text-gray-600">Cargando torneos…</div>
    <div v-else-if="tournamentStore.error" class="py-6 text-red-600">
      {{ tournamentStore.error.message || 'Error al cargar torneos' }}
    </div>

    <ListTable v-else :columns="columns" :data="filteredTournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
        <button @click="editTournament(row.id)" class="text-blue-600 hover:underline mr-2">Editar</button>
        <button @click="toggleTournament(row)" class="text-yellow-600 hover:underline mr-2">
          {{ row.isActive ? 'Cerrar' : 'Abrir' }}
        </button>
        <button @click="deleteTournament(row.id)" class="text-red-600 hover:underline">Eliminar</button>
      </template>
    </ListTable>

    <!-- Modal ShowTournament -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowTournament :tournament="selectedTournament" :categories="categories" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts.js'
import { formatDateLongEs } from '@/utils/dateUtils'
import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'
import { useTournamentStore } from '@/stores/useTournamentStore'

const router = useRouter()
const tournamentStore = useTournamentStore()

const showModal = ref(false)
const selectedTournament = ref(null)
const categories = ref([])

/** Controles de búsqueda y filtro */
const searchName = ref('')
const searchFacility = ref('')
const statusFilter = ref('all') // all | active | inactive

/** Columnas (sin estado) */
const columns = [
  { label: 'Nombre', field: 'name' },
  { label: 'Facility', field: 'facility_name' },
  { label: 'Fecha Inicio', field: 'date_start' },
  { label: 'Fecha Cierre', field: 'date_end' },
]

const norm = (v) => (v ?? '').toString().toLowerCase().trim()
const tournaments = computed(() => tournamentStore.tournaments || [])

const filteredTournaments = computed(() => {
  const qName = norm(searchName.value)
  const qFacility = norm(searchFacility.value)
  const wantActive = statusFilter.value === 'active'
  const wantInactive = statusFilter.value === 'inactive'

  return (tournaments.value || [])
    .filter(t => {
      if (wantActive && !t.isActive) return false
      if (wantInactive && t.isActive) return false
      const name = norm(t.name)
      const facilityName = norm(t.facility?.name ?? t.facility_name ?? t.facilityName ?? '')
      const matchesName = qName ? name.includes(qName) : true
      const matchesFacility = qFacility ? facilityName.includes(qFacility) : true
      return matchesName && matchesFacility
    })
    .map(t => ({
      ...t,
      facility_name: t.facility?.name ?? t.facility_name ?? t.facilityName ?? '—',
      date_start: formatDateLongEs(t.date_start),
      date_end: formatDateLongEs(t.date_end),
    }))
})

const goToCreate = () => router.push({ name: 'CreateTournament' })
const editTournament = (id) => router.push({ name: 'EditTournament', params: { id } })

/** Abrir/Cerrar según estado actual (usa SIEMPRE el store) */
const toggleTournament = async (row) => {
  const isActive = !!row.isActive
  const title = isActive ? 'Cerrar torneo' : 'Abrir torneo'
  const text = isActive
    ? '¿Estás seguro de que querés cerrar este torneo? No podrás agregar más categorías ni inscribir jugadores.'
    : '¿Querés volver a abrir este torneo? Podrás gestionar categorías e inscripciones nuevamente.'
  const confirmText = isActive ? 'Sí, cerrar' : 'Sí, abrir'

  const result = await Swal.fire({
    title, text, icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar'
  })
  if (!result.isConfirmed) return

  try {
    // Forzamos el estado deseado y delegamos en el store
    await tournamentStore.toggleActive(row.id, !isActive)

    // Refrescamos SOLO ese torneo para evitar otra llamada de lista completa
    await tournamentStore.fetchTournamentById(row.id)

    showToast({
      message: isActive
        ? 'El torneo fue cerrado correctamente.'
        : 'El torneo fue abierto correctamente.',
      type: 'success'
    })
  } catch (e) {
    console.error('No se pudo cambiar el estado del torneo:', e)
    showToast({ message: e?.message || 'Error al cambiar el estado del torneo', type: 'error' })
  }
}

const deleteTournament = async (id) => {
  const result = await Swal.fire({
    title: 'Finalizar torneo',
    text: '¿Estás seguro de que querés finalizar este torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Cancelar'
  })
  if (!result.isConfirmed) return

  try {
    await tournamentStore.deleteTournament(id)
    showToast({ message: 'El torneo fue cerrado correctamente.', type: 'success' })
    await tournamentStore.fetchTournaments()
    router.push({ name: 'IndexTournament' })
  } catch (e) {
    showToast({ message: e?.message || 'Error al cerrar el torneo', type: 'error' })
  }
}

const viewTournament = (tournament) => {
  selectedTournament.value = tournament
  categories.value = Array.isArray(tournament.categories) ? tournament.categories : []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTournament.value = null
}

onMounted(async () => {
  await tournamentStore.fetchTournaments()
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
