<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos Abiertos</h2>
      <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Torneo</button>
    </div>

    <div v-if="tournamentStore.loading" class="py-6 text-gray-600">Cargando torneos…</div>
    <div v-else-if="tournamentStore.error" class="py-6 text-red-600">
      {{ tournamentStore.error.message || 'Error al cargar torneos' }}
    </div>

    <ListTable v-else :columns="columns" :data="openTournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
        <button @click="editTournament(row.id)" class="text-blue-600 hover:underline mr-2">Editar</button>
        <button @click="closeTournament(row.id)" class="text-yellow-600 hover:underline mr-2">Cerrar</button>
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

const columns = [
  { label: 'Nombre', field: 'name' },
  { label: 'Fecha Inicio', field: 'date_start' },
  { label: 'Fecha Cierre', field: 'date_end' },
]

const tournaments = computed(() => tournamentStore.tournaments || [])
const openTournaments = computed(() =>
  tournaments.value
    .filter(t => t.isActive)
    .map(t => ({
      ...t,
      date_start: formatDateLongEs(t.date_start), // asumiendo que tu campo es date_start
      date_end: formatDateLongEs(t.date_end) // asumiendo que tu campo es date_end
    }))
)

const goToCreate = () => router.push({ name: 'CreateTournament' })

const editTournament = (tournamentId) => router.push({ name: 'EditTournament', params: { id: tournamentId } })

const closeTournament = async (id) => {
  const result = await Swal.fire({
    title: 'Cerrar torneo',
    text: '¿Estás seguro de que querés cerrar este torneo? No podrás agregar más categorías ni inscribir jugadores.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar',
    cancelButtonText: 'Cancelar'
  })
  if (!result.isConfirmed) return

  try {
    await tournamentStore.closeTournament(id)
    showToast({ message: 'El torneo fue cerrado correctamente.', type: 'success' })
    await tournamentStore.fetchTournaments()
  } catch (e) {
    console.log('No se pudo cerrar el torneo:', e)
    showToast({ message: e?.message || 'Error al cerrar el torneo', type: 'error' })
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

    // Si seguís usando esta lógica de limpieza de categorías en backend:
    // await categoryStore.deleteCategories(id)

    showToast({ message: 'El torneo fue cerrado correctamente.', type: 'success' })
    await tournamentStore.fetchTournaments()
    router.push({ name: 'IndexTournament' })
  } catch (e) {
    showToast({ message: e?.message || 'Error al cerrar el torneo', type: 'error' })
  }
}

const viewTournament = (tournament) => {
  selectedTournament.value = tournament
  // ✅ Tomamos categorías directamente del torneo recibido por API/store:
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
