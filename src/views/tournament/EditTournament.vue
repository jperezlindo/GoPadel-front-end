<template>
  <div>
    <StepIndicator :steps="['Editar Información', 'Editar Categorías', 'Confirmación']" :currentStep="step"/>

    <TournamentForm 
      v-if="step === 1" 
      :modelValue="tournament" 
      :isEditMode="true" 
      @cancel="handleCancelEdit"
      @submit="handleTournamentUpdate" />

    <TournamentCategoryForm 
      v-if="step === 2" 
      :isEditMode="true" 
      :availableCategories="availableCategories" 
      :categories="categoriesAdded"
      @submit-categories="handleCategoryUpdate" />

    <ShowTournament 
      v-if="step === 3 && tournament && newCategories.length" 
      :tournament="tournament"
      :categories="newCategories" 
      :editable="true" 
      :isEditMode="true"
      @detailsConfirm="editTournament"
      @cancel="handleCancelEdit" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts.js'
import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore.js'
import { useTournamentCategoryStore } from '@/stores/useTournamentCategoryStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const tournamentCategoryStore = useTournamentCategoryStore()
const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

const step = ref(1)
const newCategories = ref([])
const tournament = ref({})
const categoriesAdded = ref([])
const router = useRouter()
const route = useRoute()

const tournamentId = computed(() => Number(route.params.id))
const availableCategories = computed(() => categoryStore.categories)

onMounted(async () => {
  await categoryStore.fetchCategories()
  tournament.value = tournamentStore.getTournamentById(tournamentId.value)
  categoriesAdded.value = tournamentCategoryStore.getCategoriesByTournament(tournamentId.value)
})

const handleTournamentUpdate = (data) => {
  tournament.value = { ...data }
  console.log(tournament.value)
  step.value = 2
}

const handleCategoryUpdate = (updatedCategories) => {
  newCategories.value = [...updatedCategories]
  step.value = 3
}

const editTournament = async () => {
  try {
    const result = await Swal.fire({
      title: '¿Confirmar cambios?',
      text: '¿Estás seguro de que querés guardar los cambios en este torneo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      tournamentStore.updateTournament({ ...tournament.value })
      await tournamentCategoryStore.updateCategories(tournament.value.id, newCategories.value)
      showToast({
        message: 'Torneo y categorías actualizados correctamente.',
        type: 'success'
      })
      router.push({ name: 'IndexTournament' })
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Ocurrió un problema al actualizar el torneo.', 'error')
  }
}

const handleCancelEdit = async () => {
  const result = await Swal.fire({
    title: 'Cancelar edición',
    text: '¿Estás seguro de cancelar la edición del torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver'
  })

  if (result.isConfirmed) {
    newCategories.value = []
    showToast({
      message: 'El torneo fue cancelado.',
      type: 'info'
    })
    router.push({ name: 'IndexTournament' })
  }
}
</script>

<style scoped>
/* Estilos opcionales */
</style>