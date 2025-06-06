<template>
    <StepIndicator :steps="['Editar Información', 'Editar Categorías', 'Confirmación']" :currentStep="step"/>

    <TournamentForm 
        v-if="step === 1" 
        :modelValue="tournament" 
        :isEditMode="true" 
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
</template>

<script setup>
import { ref } from 'vue'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore.js'
import { useCategoryStore } from '@/stores/useCategoryStore.js'

const step = ref(1)
const categoryStore = useCategoryStore()
const tournamentStore = useTournamentStore()

const tournament = tournamentStore.tournament
const categoriesAdded = categoryStore.categoriesAdded
const availableCategories = categoryStore.availableCategories
const newCategories = ref([])

const handleTournamentUpdate = (data) => {
    tournament.value = { ...data }
    step.value = 2
}

const handleCategoryUpdate = (updatedCategories) => {
    newCategories.value = [...updatedCategories]
    step.value = 3
}

const editTournament = () => {
    tournamentStore.setTournament({...tournament})
    categoryStore.setNewCategories([...newCategories.value])
    console.log('Todo listo para conectar a la APi y crear el torneo')
}

const handleCancelEdit = () => {
    // Podés agregar navegación u otro comportamiento
    step.value = 1
}
</script>

<style scoped>
/* Estilos opcionales */
</style>
