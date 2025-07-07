<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Registro al Torneo</h2>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-4 overflow-x-auto">
            <div class="space-y-2 mb-6">
                <p><span class="font-semibold">Nombre:</span> {{ tournament?.name }}</p>
                <p><span class="font-semibold">Fecha de inicio:</span> {{ formatDate(tournament?.start_date) }}</p>
                <p><span class="font-semibold">Fecha de finalización:</span> {{ formatDate(tournament?.end_date) }}</p>
            </div>

            <!-- Select de categoría -->
            <div class="mb-4">
                <label for="category-select" class="block mb-1 font-medium text-gray-700">Categoría</label>
                <select id="category-select" v-model="selectedCategoryId" class="w-full p-2 border rounded-lg" aria-label="Seleccionar categoría">
                    <option disabled value="">Seleccione una categoría</option>
                    <option v-for="cat in categoriesAdded" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>

            <!-- Buscador de compañero -->
            <div class="mb-4">
                <label for="partner-search" class="block mb-1 font-medium text-gray-700">Buscar partner</label>
                <input id="partner-search" v-model="partnerSearch" type="text" placeholder="Ingrese nombre del jugador" class="w-full p-2 border rounded-lg" aria-label="Buscar partner" />
                <ul v-if="filteredPartners.length" class="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                    <li v-for="partner in filteredPartners" :key="partner.id" @click="selectPartner(partner)"
                        class="p-2 hover:bg-gray-100 cursor-pointer">
                        {{ partner.name }}
                    </li>
                </ul>
                <p v-if="selectedPartner" class="mt-2 text-sm text-green-600">
                    Partner seleccionado: {{ selectedPartner.name }}
                </p>
            </div>

            <!-- Horarios no disponibles -->
            <div class="mb-4">
                <label class="block mb-2 font-medium text-gray-700">Horarios en los que no podés jugar (Lunes a Viernes)</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    <label v-for="slot in timeSlots" :key="slot" class="flex items-center space-x-2">
                        <input type="checkbox" :value="slot" v-model="unavailableTimes" class="accent-red-600" :aria-label="'No disponible en ' + slot" />
                        <span class="text-sm">{{ slot }}</span>
                    </label>
                </div>
            </div>

            <!-- Botón de inscripción -->
            <div class="mt-6 flex flex-col sm:flex-row gap-2">
                <button @click="handleCancel"
                    class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full"
                    aria-label="Cancelar inscripción">
                    Cancelar
                </button>
                <button
                    @click="submitRegistration"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full"
                    aria-label="Confirmar inscripción"
                >
                    Confirmar inscripción
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useTournamentStore } from '@/stores/useTournamentStore.js'
import { useTournamentCategoryStore } from '@/stores/useTournamentCategoryStore'

import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts.js'

const router = useRouter()
const route = useRoute()

const tournamentCategoryStore = useTournamentCategoryStore()
const tournamentStore = useTournamentStore()

const tournament = ref({})
const categoriesAdded = ref([])
const selectedCategoryId = ref(0)
const partnerSearch = ref('')
const selectedPartner = ref(null)
const unavailableTimes = ref([])

const tournamentId = computed(() => Number(route.params.id))

onMounted(() => {
    tournament.value = tournamentStore.getTournamentById(tournamentId.value)
    categoriesAdded.value = tournamentCategoryStore.getCategoriesByTournament(tournamentId.value)
})

// Franja horaria general
const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00',
]

const filteredPartners = ref([])

const selectPartner = (partner) => {
    selectedPartner.value = partner
    partnerSearch.value = ''
}

const formatDate = (dateStr) => {
    if (!dateStr) return 'No definida'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const submitRegistration = () => {
  if (!selectedCategoryId.value || !selectedPartner.value) {
    alert('Por favor seleccione una categoría y un compañero.')
    return
  }

  const payload = {
    tournament_id: tournamentId.value,
    category_id: selectedCategoryId.value,
    partner_id: selectedPartner.value.id,
    unavailable_times: unavailableTimes.value
  }

  console.log('Payload de inscripción:', payload)

  // Aquí iría el llamado a la API
  // await tournamentRegistrationStore.register(payload)
  // SweetAlert para confirmar
}

const handleCancel = async () => {
  const result = await Swal.fire({
    title: 'Cancelar Inscripción',
    text: '¿Estás seguro de cancelar la Inscripción al torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver'
  })

  if (result.isConfirmed) {
    showToast({
      message: 'La Inscripción fue cancelada.',
      type: 'success'
    })
    router.push({ name: 'Home' })
  }
}
</script>
