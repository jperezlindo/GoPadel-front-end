<template>
    <StepIndicator :steps="['Información del Torneo', 'Categorías', 'Confirmación']" :currentStep="step" />

    <TournamentForm v-if="step === 1" :modelValue="tournament" @submit="handleTournamentCreate" />

    <TournamentCategoryForm v-if="step === 2" :availableCategories="availableCategories" :initialCategories="categories"
        @submit-categories="handleTournamentCategoryCreate" />

    <ShowTournament v-if="step === 3 && tournament && categories.length" :tournament="tournament"
        :categories="categories" :editable="true" :isEditing="false" @detailsConfirm="createTournament"
        @cancel="handleTournamentCancel" />

    <ConfirmDialog v-if="showDialog" :visible="showDialog" :message="msg" @confirm="handleDialogYes"
        @cancel="handleDialogNo" />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const router = useRouter()

const step = ref(1)
const msg = ref('')
const showDialog = ref(false)
const categories = ref([])
const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

const availableCategories = categoryStore.availableCategories

const tournament = ref({
    name: '',
    start_date: '',
    end_date: ''
})


const handleTournamentCreate = (data) => {
    tournament.value = { ...data }
    step.value = 2
}

const handleTournamentCategoryCreate = (categoriesParticipants) => {
    categories.value = [...categoriesParticipants]
    step.value = 3
}

const createTournament = () => {
    tournamentStore.setTournament({...tournament})
    categoryStore.setNewCategories([...categories.value])
    console.log('Todo listo para conectar a la APi y crear el torneo')
    
}

const handleTournamentCancel = () => {
    tournament.value = { name: '', start_date: '', end_date: '' }
    categories.value = []
    step.value = 1
}

const handleDialogYes = () => {
    showDialog.value = false
    console.log('Confirmado')
}

const handleDialogNo = () => {
    showDialog.value = false
    console.log('Cancelado')
}
</script>

<style scoped>
/* estilos opcionales */
</style>
