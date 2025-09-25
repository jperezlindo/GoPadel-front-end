<!-- src/views/tournament/CreateTournament.vue -->
<template>
  <div>
    <StepIndicator :steps="['Información del Torneo', 'Categorías', 'Confirmación']" :currentStep="step" />

    <TournamentForm v-if="step === 1" :modelValue="tournamentForm" @submit="handleTournamentCreate"
      @cancel="handleTournamentCancel" />

    <TournamentCategoryForm v-if="step === 2" :availableCategories="availableCategories" :categories="categoriesRows"
      @submit-categories="handleTournamentCategoryCreate" @cancel="handleTournamentCancel" />

    <ShowTournament v-if="step === 3 && categoriesRows.length" :tournament="tournamentPreview"
      :categories="categoriesPreview" :editable="true" :isEditMode="false" @detailsConfirm="createTournament"
      @cancel="handleTournamentCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import StepIndicator from '@/components/StepIndicator.vue'
import TournamentForm from '@/components/TournamentForm.vue'
import TournamentCategoryForm from '@/components/TournamentCategoryForm.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'

import { showToast } from '@/utils/alerts'
import { parseApiError } from '@/utils/handleApi'
import type { TournamentFront, TournamentCategoryFront } from '@/services/tournamentApi'
import { useTournamentStore } from '@/stores/useTournamentStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

/** ===== Tipos locales ===== */
type TournamentFormModel = {
  name: string
  date_start: string // 'YYYY-MM-DD' (sin hora)
  date_end: string   // 'YYYY-MM-DD' (sin hora)
}

type SimpleCategory = { id: number; name: string }
type TournamentCategoryRow = {
  name: string
  price: number
  category_id: number | '' // select arranca en '' y luego pasa a number
  isActive?: boolean
}

/** ===== Constantes ===== */
const DEFAULT_FACILITY_ID = 1

/** ===== Stores / Router ===== */
const router = useRouter()
const tournamentStore = useTournamentStore()
const categoryStore = useCategoryStore()

/** ===== Estado UI ===== */
const step = ref(1)
const availableCategories = ref<SimpleCategory[]>([])

// Paso 1
const tournamentForm = ref<TournamentFormModel>({
  name: '',
  date_start: '',
  date_end: '',
})

// Paso 2
const categoriesRows = ref<TournamentCategoryRow[]>([])

/** ===== Carga catálogo categorías ===== */
onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    availableCategories.value = (categoryStore.categories || []).map((c: any) => ({
      id: Number(c?.id ?? 0),
      name: String(c?.name ?? ''),
    }))
  } catch {
    /* el store ya loguea el error */
  }
})

/** ===== Handlers ===== */
const handleTournamentCreate = (data: TournamentFormModel) => {
  tournamentForm.value = { ...data } // mantiene YYYY-MM-DD
  step.value = 2
}

const handleTournamentCategoryCreate = (cats: TournamentCategoryRow[]) => {
  categoriesRows.value = Array.isArray(cats) ? [...cats] : []
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
    tournamentForm.value = { name: '', date_start: '', date_end: '' }
    categoriesRows.value = []
    showToast({ message: 'El torneo fue cancelado.', type: 'success' })
    router.push({ name: 'IndexTournament' })
  }
}

/** ===== Vista previa para ShowTournament ===== */
const tournamentPreview = computed<TournamentFront>(() => ({
  id: 0,
  name: String(tournamentForm.value?.name ?? ''),
  date_start: tournamentForm.value?.date_start || null, // YYYY-MM-DD
  date_end: tournamentForm.value?.date_end || null,     // YYYY-MM-DD
  facility_id: DEFAULT_FACILITY_ID,
  facility: '',
  facility_name: '',
  isActive: true,
  categories: [], // ShowTournament recibe categories aparte
}))

const categoriesPreview = computed<TournamentCategoryFront[]>(() => {
  const rows = Array.isArray(categoriesRows.value) ? categoriesRows.value : []
  return rows.map(r => ({
    name: String(r?.name ?? '').trim(),
    price: Number(r?.price ?? 0),
    is_active: true,
    // para preview da igual, pero mantengo ambos por tipado laxo
    category_id: typeof r?.category_id === 'string' ? Number(r.category_id) : (r?.category_id ?? null),
    category: typeof r?.category_id === 'string' ? Number(r.category_id) : (r?.category_id ?? null),
  }))
})

/** ===== POST create ===== */
const createTournament = async () => {
  try {
    const result = await Swal.fire({
      title: '¿Crear torneo?',
      text: '¿Estás seguro de que querés crear este torneo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    const t = tournamentForm.value
    const rows = categoriesRows.value

    // Validaciones mínimas FRONT
    const errors: string[] = []
    if (!t.name || !String(t.name).trim()) errors.push('El nombre es obligatorio.')
    if (!t.date_start) errors.push('La fecha de inicio es obligatoria.')
    if (!t.date_end) errors.push('La fecha de finalización es obligatoria.')
    if (!rows.length) errors.push('Debés agregar al menos una categoría.')
    if (errors.length) {
      await Swal.fire('Datos incompletos', errors.join('\n'), 'warning')
      return
    }

    // 🔴 IMPORTANTE: Formato EXACTO como Postman (sin hora/offset)
    const payload = {
      name: String(t.name).trim(),
      date_start: t.date_start, // 'YYYY-MM-DD'
      date_end: t.date_end,     // 'YYYY-MM-DD'
      is_active: true,
      facility_id: DEFAULT_FACILITY_ID,
      categories: rows
        .map(r => ({
          name: String(r?.name ?? '').trim(),
          price: Number(r?.price ?? 0),
          // El backend espera "category" (PK de Category)
          category: typeof r?.category_id === 'string'
            ? Number(r.category_id)
            : (r?.category_id ?? null),
        }))
        // Evito mandar basura
        .filter(c => c.name && Number.isFinite(c.price) && (c.category === null || (typeof c.category === 'number' && c.category > 0))),
    }

    const created = await tournamentStore.createTournament(payload as any)
    void created // por si no lo usás

    showToast({ message: 'El torneo fue creado exitosamente.', type: 'success' })
    router.push({ name: 'IndexTournament' })
  } catch (error: any) {
    const msg = parseApiError(error) || 'Ocurrió un problema al crear el torneo.'
    Swal.fire('Error', msg, 'error')
  }
}
</script>
