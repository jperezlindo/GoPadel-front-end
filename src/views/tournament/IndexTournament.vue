<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos Abiertos</h2>
      <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Torneo</button>
    </div>

    <ListTable :columns="columns" :data="openTournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
        <button @click="editTournament(row.id)" class="text-blue-600 hover:underline mr-2">Editar</button>
        <button @click="closeTournament(row.id)" class="text-red-600 hover:underline">Cerrar</button>
      </template>
    </ListTable>

    <!-- Modal para ShowTournament -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowTournament :tournament="selectedTournament" :categories="categories" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/alerts.js'
import Swal from 'sweetalert2'

import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useTournamentCategoryStore } from '@/stores/useTournamentCategoryStore.js'

const router = useRouter()
const tournamentStore = useTournamentStore()
const categoryStore = useTournamentCategoryStore()

let tournaments = tournamentStore.tournaments
let categories = []
let selectedTournament = {}
const showModal = ref(false)

const columns = [
  { label: 'Nombre', field: 'name' },
  { label: 'Fecha Inicio', field: 'start_date' },
  { label: 'Fecha Cierre', field: 'end_date' },
]

const openTournaments = computed(() => {
  if (!Array.isArray(tournaments)) return []
  return tournaments.filter(t => t.isActive)
})

const goToCreate = () => {
  router.push({ name: 'CreateTournament' })
}

const editTournament = (tournamentId) => {
  router.push({ name: 'EditTournament', params: { id: tournamentId } })
}

const closeTournament = async (id) => {
  const result = await Swal.fire({
    title: 'Finalizar torneo',
    text: '¿Estás seguro de que querés finalizar este torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    const tournamentId = await tournamentStore.deleteTournament(id)
    await categoryStore.deleteCategories(tournamentId)
    showToast({
        message: 'El torneo fue cerrado correctamente.',
        type: 'success'
    })
    router.push({ name: 'IndexTournament' })
  } else {
    console.log('El usuario canceló la acción.')
  }
}

const viewTournament = (tournament) => {
  selectedTournament = tournament
  categories = categoryStore.getCategoriesByTournament(tournament.id)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTournament.value = null
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
