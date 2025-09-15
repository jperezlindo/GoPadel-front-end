<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos Abiertos</h2>
    </div>

    <!-- Estados de carga / error al estilo IndexTournament -->
    <div v-if="tournamentStore.loading" class="py-6 text-gray-600">Cargando torneos…</div>
    <div v-else-if="tournamentStore.error" class="py-6 text-red-600">
      {{ tournamentStore.error.message || 'Error al cargar torneos' }}
    </div>

    <ListTable v-else :columns="columns" :data="openTournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
        <button @click="handleRegister(row)" class="text-blue-600 hover:underline mr-2">Registrarme</button>
      </template>
    </ListTable>

    <!-- Modal ShowTournament -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowTournament :tournament="selectedTournament" :categories="categories" />
        <div class="flex justify-center mt-6">
          <button @click="handleRegister(selectedTournament)"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow transition duration-200 w-full md:w-auto">
            Registrarme al Torneo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/alerts.js'
import { formatDateLongEs } from '@/utils/dateUtils' // mismo formateo que IndexTournament

import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'
import { useTournamentStore } from '@/stores/useTournamentStore'

const router = useRouter()
const tournamentStore = useTournamentStore()

const showModal = ref(false)
const selectedTournament = ref(null)
const categories = ref([]) // se carga desde el torneo seleccionado

/** Columnas alineadas con IndexTournament */
const columns = [
  { label: 'Nombre', field: 'name' },
  { label: 'Facility', field: 'facility_name' },
  { label: 'Fecha Inicio', field: 'date_start' },
  { label: 'Fecha Cierre', field: 'date_end' },
]

/** Lista de torneos abiertos + mapeos y formateo como en IndexTournament */
const openTournaments = computed(() => {
  return (tournamentStore.tournaments || [])
    .filter(t => !!t.isActive)
    .map(t => ({
      ...t,
      facility_name: t.facility?.name ?? t.facility_name ?? t.facility ?? '—',
      date_start: formatDateLongEs(t.date_start),
      date_end: formatDateLongEs(t.date_end),
    }))
})

const handleRegister = (tournament) => {
  router.push({ name: 'RegistrationTournament', params: { id: tournament.id } })
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

/** Carga inicial solo torneos abiertos, manteniendo fallback en front */
onMounted(async () => {
  try {
    await tournamentStore.fetchTournaments({ is_active: true, ordering: 'date_start' })
  } catch (e) {
    console.error(e)
    showToast({ message: 'No se pudieron cargar los torneos abiertos.', type: 'error' })
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
