<template>
  <div class="">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos Abiertos</h2>
    </div>

    <ListTable :columns="columns" :data="tournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Detalles</button>
         <button @click="handleRegister(row)" class="text-blue-600 hover:underline mr-2">Registrarme</button>
      </template>
    </ListTable>
    
    <!-- Modal para ShowTournament -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowTournament :tournament="selectedTournament" :categories="categories" />
        <div class="flex justify-center mt-6">
          <button
            @click="handleRegister(selectedTournament)"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow transition duration-200 w-full md:w-auto"
          >
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

import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts.js'
import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useTournamentCategoryStore } from '@/stores/useTournamentCategoryStore.js'

const router = useRouter()
const tournamentStore = useTournamentStore()
const categoryStore = useTournamentCategoryStore()

let categories = []
const selectedTournament = ref({})
const showModal = ref(false)

const columns = [
  { label: 'Nombre', field: 'name' },
  { label: 'Fecha Inicio', field: 'start_date' },
  { label: 'Fecha Cierre', field: 'end_date' },
  { label: 'Lugar', field: 'venue'}

]

const tournaments = computed(() => tournamentStore.tournaments)

const handleRegister = (tournament) => {
  router.push({ name: 'RegistrationTournament', params: { id: tournament.id }})
}

const viewTournament = (tournament) => {
  selectedTournament.value = tournament
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
