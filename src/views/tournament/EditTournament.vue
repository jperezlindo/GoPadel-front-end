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
      @cancel="handleCancelEdit"
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
import { formatDateISO } from '@/utils/dateUtils'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const router = useRouter()
const route = useRoute()

const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

const step = ref(1)
const tournament = ref(null)
const categoriesAdded = ref([])
const newCategories = ref([])

const tournamentId = computed(() => Number(route.params.id))
const availableCategories = computed(() => categoryStore.categories || [])

const loadData = async () => {
  // 1) Traer catálogo de categorías disponibles para el paso 2
  await categoryStore.fetchCategories()

  // 2) Obtener torneo desde store (si no está en memoria, llamar API)
  let t = tournamentStore.getTournamentById(tournamentId.value)
  if (!t) {
    t = await tournamentStore.fetchTournamentById(tournamentId.value)
  }

  // 3) Castear fechas si existen
  if (t) {
    t = {
      ...t,
      date_start: formatDateISO(t.date_start),
      date_end: formatDateISO(t.date_end)
    }
  }

  tournament.value = t || {}
  // 4) Categorías actuales del torneo (vienen embebidas en el torneo)
  categoriesAdded.value = Array.isArray(t?.categories) ? [...t.categories] : []
}

onMounted(loadData)

const handleTournamentUpdate = (data) => {
  // Avanzar al paso 2 con los cambios en memoria (sin persistir aún)
  tournament.value = { ...data }
  step.value = 2
}

const handleCategoryUpdate = (updatedCategories) => {
  // Avanzar al paso 3 mostrando el resumen (categorías nuevas/ajustadas)
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
    if (!result.isConfirmed) return

    // Construir payload EXACTO requerido por el backend
    const payload = {
      id: tournament.value.id,
      name: tournament.value?.name ?? '',
      date_start: tournament.value?.date_start || '',
      date_end: tournament.value?.date_end || '',
      is_active: Boolean(
        tournament.value?.is_active ?? tournament.value?.isActive ?? false
      ),
      facility_id: (
        tournament.value?.facility_id ??
        // si viniera como objeto/relación, intenta tomar el id
        tournament.value?.facility?.id ??
        tournament.value?.facility ??
        null
      ),
      categories: (newCategories.value ?? []).map(c => ({
        id: c?.id ?? null,
        name: c?.name ?? '',
        price: Number(c?.price ?? 0),
        // Acepta category_id | category | id y lo normaliza a "category"
        category: Number(
          c?.category ?? c?.category_id ?? c?.id ?? 0
        )
      })).filter(cat => Number.isFinite(cat.category) && cat.category > 0)
    }

    // Llamada al store / API
    // Si tu store usa (id, body):
    await tournamentStore.updateTournament(tournament.value.id, payload)
    // Si tu store espera un objeto con id y data, usa en su lugar:
    // await tournamentStore.updateTournament({ id: tournament.value.id, data: payload })

    showToast({ message: 'Torneo y categorías actualizados correctamente.', type: 'success' })
    router.push({ name: 'IndexTournament' })
  } catch (err) {
      console.error(err)
      Swal.fire('Error', err.message || 'Error inesperado', 'error')
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
    showToast({ message: 'La edición del torneo fue cancelada.', type: 'info' })
    router.push({ name: 'IndexTournament' })
  }
}
</script>

<style scoped>
/* Estilos opcionales */
</style>
