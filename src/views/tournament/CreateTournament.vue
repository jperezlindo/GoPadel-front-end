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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/alerts.js'

import Swal from 'sweetalert2'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const router = useRouter()

const step = ref(1)
const categories = ref([])

const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

const availableCategories = categoryStore.availableCategories

const tournament = ref({
  name: '',
  start_date: '',
  end_date: '',
  sports_complex_id: 1,
  isActive: true
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

    if (result.isConfirmed) {
      tournamentStore.setTournament({ ...tournament.value })
      const tournamentId = await tournamentStore.createTournament()
      categoryStore.setNewCategories([...categories.value])
      await categoryStore.createCategories(tournamentId)

      showToast({
        message: 'El torneo fue creado exitosamente.',
        type: 'info'
      })
      router.push({ name: 'IndexTournament' })
    }

  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Ocurrió un problema al crear el torneo.', 'error')
  }
}
</script>

<style scoped>
/* estilos opcionales */
</style>
