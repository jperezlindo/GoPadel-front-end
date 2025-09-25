<!-- src/views/tournament/EditTournament.vue -->
<template>
  <div>
    <StepIndicator :steps="['Editar Información', 'Editar Categorías', 'Confirmación']" :currentStep="step" />

    <!-- Paso 1: editar datos del torneo -->
    <TournamentForm v-if="step === 1" :modelValue="tournamentForm" :isEditMode="true" @cancel="handleCancelEdit"
      @submit="handleTournamentUpdate" />

    <!-- Paso 2: editar categorías -->
    <TournamentCategoryForm v-if="step === 2" :isEditMode="true" :availableCategories="availableCategories"
      :categories="categoriesRows" @cancel="handleCancelEdit" @submit-categories="handleCategoryUpdate" />

    <!-- Paso 3: confirmación -->
    <ShowTournament v-if="step === 3 && categoriesRows.length" :tournament="tournamentPreview"
      :categories="categoriesPreview" :editable="true" :isEditMode="true" @detailsConfirm="editTournament"
      @cancel="handleCancelEdit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { showToast } from '@/utils/alerts'
import { formatDateISO } from '@/utils/dateUtils'
import { parseApiError } from '@/utils/handleApi'

import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

import type {
  TournamentFront,
  TournamentCategoryFront,
} from '@/services/tournamentApi'

/** ===== Constantes ===== */
const DEFAULT_FACILITY_ID = 1

/** ===== Router / Stores ===== */
const router = useRouter()
const route = useRoute()
const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

/** ===== Estado del flujo ===== */
const step = ref < number > (1)

/** Torneo cargado desde API/store (para conservar id, facility, etc.) */
const loadedTournament = ref < TournamentFront | null > (null)

/** Paso 1: formulario del torneo (forma mínima esperada por TournamentForm) */
type TournamentFormModel = {
  name: string
  date_start: string // 'YYYY-MM-DD'
  date_end: string   // 'YYYY-MM-DD'
}
const tournamentForm = ref < TournamentFormModel > ({
  name: '',
  date_start: '',
  date_end: '',
})

/** Paso 2: catálogo y filas editables */
type SimpleCategory = { id: number; name: string }
const availableCategories = computed < SimpleCategory[] > (
  () => (categoryStore as any).categories ?? []
)

/** Fila editable en el form de categorías */
type TournamentCategoryRow = {
  id?: number
  name: string
  price: number
  category_id: number | ''  // select parte en '' y luego número
  isActive?: boolean
}
const categoriesRows = ref < TournamentCategoryRow[] > ([])

/** ===== Carga inicial ===== */
const tournamentId = computed(() => Number(route.params.id))

const loadData = async () => {
  // 1) catálogo
  await categoryStore.fetchCategories()

  // 2) torneo (desde memoria o API)
  let t = tournamentStore.getTournamentById(tournamentId.value)
  if (!t) t = await tournamentStore.fetchTournamentById(tournamentId.value)

  if (t) {
    loadedTournament.value = t

    // Form paso 1 (normalizo fechas a 'YYYY-MM-DD')
    tournamentForm.value = {
      name: t.name ?? '',
      date_start: formatDateISO(t.date_start) || '',
      date_end: formatDateISO(t.date_end) || '',
    }

    // Filas paso 2 desde las categorías del torneo
    categoriesRows.value = Array.isArray(t.categories)
      ? t.categories.map((c) => ({
        id: c?.id,
        name: c?.name ?? '',
        price: Number(c?.price ?? 0),
        category_id:
          (c?.category_id ?? c?.category ?? (c as any)?.id ?? '') as number | '',
        isActive: (c as any)?.isActive ?? (c as any)?.is_active ?? true,
      }))
      : []
  } else {
    // Si no se encontró, vuelvo al índice
    showToast({ type: 'error', message: 'Torneo no encontrado.' })
    router.replace({ name: 'IndexTournament' })
  }
}

onMounted(loadData)

/** ===== Handlers de pasos ===== */
const handleTournamentUpdate = (data: TournamentFormModel) => {
  tournamentForm.value = { ...data }
  step.value = 2
}

const handleCategoryUpdate = (updated: TournamentCategoryRow[]) => {
  categoriesRows.value = [...updated]
  step.value = 3
}

/** ===== Vista previa para ShowTournament ===== */
const tournamentPreview = computed < TournamentFront > (() => ({
  id: loadedTournament.value?.id ?? 0,
  name: tournamentForm.value.name,
  date_start: tournamentForm.value.date_start || null,
  date_end: tournamentForm.value.date_end || null,
  facility_id: loadedTournament.value?.facility_id ?? DEFAULT_FACILITY_ID,
  facility: loadedTournament.value?.facility ?? '',
  // si tu tipo TournamentFront tiene facility_name requerido, lo completamos
  // @ts-ignore - solo si en tu interfaz es opcional, ignora este campo
  facility_name: (loadedTournament.value as any)?.facility_name ?? '',
  isActive: loadedTournament.value?.isActive ?? true,
  categories: [], // ShowTournament recibe 'categories' aparte
}))

const categoriesPreview = computed < TournamentCategoryFront[] > (() =>
  categoriesRows.value.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price ?? 0),
    category_id: r.category_id === '' ? null : Number(r.category_id),
  }))
)

/** ===== Guardar cambios (PATCH via store) ===== */
const editTournament = async () => {
  try {
    const result = await Swal.fire({
      title: '¿Confirmar cambios?',
      text: '¿Estás seguro de que querés guardar los cambios en este torneo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    if (!loadedTournament.value) {
      throw new Error('Torneo no cargado')
    }

    // Validaciones mínimas
    const errs: string[] = []
    if (!tournamentForm.value.name.trim()) errs.push('El nombre es obligatorio.')
    if (!tournamentForm.value.date_start) errs.push('La fecha de inicio es obligatoria.')
    if (!tournamentForm.value.date_end) errs.push('La fecha de finalización es obligatoria.')
    if (errs.length) {
      await Swal.fire('Datos incompletos', errs.join('\n'), 'warning')
      return
    }

    // Payload FRONT → el servicio hará toApi()
    const payload: Partial<TournamentFront> = {
      name: tournamentForm.value.name.trim(),
      date_start: tournamentForm.value.date_start,
      date_end: tournamentForm.value.date_end,
      isActive: loadedTournament.value.isActive,
      facility_id: loadedTournament.value.facility_id ?? DEFAULT_FACILITY_ID,
      categories: categoriesPreview.value.map((c) => ({
        id: c.id,
        name: c.name,
        price: Number(c.price ?? 0),
        // dejamos category_id; el mapper toApi lo normaliza a "category"
        category_id: c.category_id ?? null,
      })),
    }

    await tournamentStore.updateTournament(loadedTournament.value.id, payload)

    showToast({ message: 'Torneo y categorías actualizados correctamente.', type: 'success' })
    router.push({ name: 'IndexTournament' })
  } catch (error: any) {
    console.error('Update failed:', error?.response?.data || error)
    const msg = parseApiError(error)
    Swal.fire('Error', msg || 'Error inesperado', 'error')
  }
}

/** ===== Cancelar edición ===== */
const handleCancelEdit = async () => {
  const result = await Swal.fire({
    title: 'Cancelar edición',
    text: '¿Estás seguro de cancelar la edición del torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver',
  })
  if (!result.isConfirmed) return

  showToast({ message: 'La edición del torneo fue cancelada.', type: 'info' })
  router.push({ name: 'IndexTournament' })
}
</script>

<style scoped>
/* Estilos opcionales */
</style>
