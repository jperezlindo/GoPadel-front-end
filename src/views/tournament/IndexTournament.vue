<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Torneos Abiertos</h2>
            <button @click="goToCreate" class="btn-primary w-auto px-4">
                + Nuevo Torneo
            </button>
        </div>

        <ListTable :columns="columns" :data="openTournaments">
            <template #actions="{ row }">
                <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
                <button @click="editTournament(row)" class="text-blue-600 hover:underline mr-2">Editar</button>
                <button @click="closeTournament(row.id)" class="text-red-600 hover:underline">Cerrar</button>
            </template>
        </ListTable>

        <!-- Modal para ShowTournament -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
                <ShowTournament :tournament="selectedTournament" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'
import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const router = useRouter()
const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

const tournaments = tournamentStore.tournaments

const columns = [
    { label: 'Nombre', field: 'name' },
    { label: 'Fecha Inicio', field: 'start_date' },
    { label: 'Fecha Cierre', field: 'end_date' },
    { label: 'Lugar', field: 'location' }
]

const openTournaments = computed(() => {
  if (!Array.isArray(tournaments)) return []
  return tournaments.filter(t => t.status === 'abierto')
})

const showModal = ref(false)
const selectedTournament = ref(null)

function goToCreate() {
    router.push({ name: 'CreateTournament' })
}

function editTournament(tournament) {
    router.push({ name: 'EditTournament', params: { id: tournament.id } })
}

function closeTournament(id) {
    const t = tournaments.value.find(t => t.id === id)
    if (t) t.status = 'cerrado'
}

function viewTournament(tournament) {
    selectedTournament.value = tournament
    console.log(selectedTournament.value)
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    selectedTournament.value = null
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
