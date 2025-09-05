<template>
  <div>
    <StepIndicator :steps="['Información del Torneo', 'Categorías', 'Confirmación']" :currentStep="step" />
    
    <TournamentForm
      v-if="step === 1"
      :modelValue="tournament"
      @submit="handleTournamentCreate"
      @cancel="handleTournamentCancel"
    />

    <TournamentCategoryForm
      v-if="step === 2"
      :availableCategories="availableCategories"
      :initialCategories="categories"
      @submit-categories="handleTournamentCategoryCreate"
    />

    <ShowTournament
      v-if="step === 3 && tournament && categories.length"
      :tournament="tournament"
      :categories="categories"
      :editable="true"
      :isEditing="false"
      @detailsConfirm="createTournament"
      @cancel="handleTournamentCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import { useRouter } from 'vue-router'

import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts.js'
import { formatDateISO, toFullISO } from '@/utils/dateUtils'
import { parseApiError } from '@/utils/handleApi'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore.js'
import { useTournamentCategoryStore } from '@/stores/useTournamentCategoryStore.js'
import { useCategoryStore } from '@/stores/useCategoryStore.js'

const tournamentStore = useTournamentStore()
const tournamentCategoryStore = useTournamentCategoryStore()
const categoryStore = useCategoryStore()
const router = useRouter()

const step = ref(1)
const categories = ref([])
const availableCategories = ref([])
const tournament = ref({
  name: '',
  start_date: '',
  end_date: '',
  facility_id: 1,
  isActive: true
})



onMounted( async () => {
  await categoryStore.fetchCategories()
  availableCategories.value = categoryStore.categories
})

const handleTournamentCreate = (data) => {
  tournament.value = { ...data }
  step.value = 2
}

const handleTournamentCategoryCreate = (categoriesParticipants) => {
  categories.value = [...categoriesParticipants]
  step.value = 3
}

const handleTournamentCancel = async () => {
  const result = await Swal.fire({
    title: 'Cancelar creación',
    text: '¿Estás seguro de cancelar la creación del torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver'
  })

  if (result.isConfirmed) {
    tournament.value = { name: '', start_date: '', end_date: '' }
    categories.value = []
    showToast({
      message: 'El torneo fue cancelado.',
      type: 'success'
    })
    router.push({ name: 'IndexTournament' })
  }
}

const createTournament = async () => {
  try {
    const result = await Swal.fire({
      title: '¿Crear torneo?',
      text: '¿Estás seguro de que querés crear este torneo? Esta acción guardará la información ingresada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    })
    if (!result.isConfirmed) return

    // Validaciones mínimas antes de postear
    const facilityId = Number(tournament.value?.facility_id ?? tournament.value?.facility?.id ?? tournament.value?.facility ?? 1)
    const errors = []
    if (!tournament.value?.name || !String(tournament.value.name).trim()) errors.push('El nombre es obligatorio.')
    if (!tournament.value?.date_start) errors.push('La fecha de inicio es obligatoria.')
    if (!tournament.value?.date_end) errors.push('La fecha de finalización es obligatoria.')
    if (!Number.isFinite(facilityId) || facilityId <= 0) errors.push('Debe seleccionar una sede válida.')

    if (errors.length) {
      await Swal.fire('Datos incompletos', errors.join('\n'), 'warning')
      return
    }

    // Payload FRONT (dejamos que el store lo mapee con toApi)
    const payload = {
      name: String(tournament.value.name).trim(),
      date_start: tournament.value.date_start, // puede ser "YYYY-MM-DD" o ISO
      date_end: tournament.value.date_end,
      is_active: Boolean(tournament.value?.is_active ?? tournament.value?.isActive),
      facility_id: facilityId,
      categories: (categories?.value ?? newCategories?.value ?? []).map(c => ({
        id: c?.id ?? undefined,
        name: c?.name ?? '',
        price: Number(c?.price ?? 0),
        // En el front puede venir con cualquiera de estos nombres
        category: Number(c?.category ?? c?.category_id ?? c?.id ?? 0)
      }))
    }

    const created = await tournamentStore.createTournament(payload) // ahora el store usa este payload
    const tournamentId = created?.id ?? created

    showToast({ message: 'El torneo fue creado exitosamente.', type: 'success' })
    router.push({ name: 'IndexTournament' })

  } catch (error) {
    console.error('Create failed:', error?.response?.data || error)
    const msg = parseApiError(error)
    Swal.fire('Error', msg || 'Ocurrió un problema al crear el torneo.', 'error')
  }
}

</script>

<style scoped>
/* estilos opcionales */
</style>
