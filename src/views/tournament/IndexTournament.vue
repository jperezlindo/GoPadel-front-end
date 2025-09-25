<!-- src/views/tournament/IndexTournament.vue -->
<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Torneos</h2>
      <button @click="goToCreate" class="btn-primary w-full sm:w-auto px-4">+ Nuevo Torneo</button>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input
        v-model="searchName"
        type="text"
        placeholder="Buscar por nombre de torneo…"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        v-model="searchFacility"
        type="text"
        placeholder="Buscar por nombre del facility…"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="statusFilter"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todos</option>
        <option value="active">Abiertos</option>
        <option value="inactive">Cerrados</option>
      </select>
    </div>

    <div v-if="tournamentStore.loading" class="py-6 text-gray-600">Cargando torneos…</div>
    <div v-else-if="errorText" class="py-6 text-red-600">
      {{ errorText }}
    </div>

    <ListTable v-else :columns="columns" :data="filteredTournaments">
      <template #actions="{ row }">
        <button @click="viewTournament(row)" class="text-green-600 hover:underline mr-2">Ver</button>
        <button @click="editTournament(row.id)" class="text-blue-600 hover:underline mr-2">Editar</button>
        <button @click="toggleTournament(row)" class="text-yellow-600 hover:underline mr-2">
          {{ row.isActive ? 'Cerrar' : 'Abrir' }}
        </button>
        <button @click="deleteTournament(row.id)" class="text-red-600 hover:underline">Eliminar</button>
      </template>
    </ListTable>

    <!-- Modal ShowTournament -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <ShowTournament :tournament="selectedTournament" :categories="categories" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { showToast } from '@/utils/alerts'
import { formatDateLongEs } from '@/utils/dateUtils'
import ListTable from '@/components/ListTable.vue'
import ShowTournament from '@/views/tournament/ShowTournament.vue'
import { useTournamentStore } from '@/stores/useTournamentStore'
import type { TournamentFront, TournamentCategoryFront } from '@/services/tournamentApi'
import type { Column } from '@/components/ListTable.vue'

const router = useRouter()
const tournamentStore = useTournamentStore()

// Modal state
const showModal = ref<boolean>(false)
const selectedTournament = ref<TournamentFront | null>(null)
const categories = ref<TournamentCategoryFront[]>([])

// Filtros
const searchName = ref<string>('')
const searchFacility = ref<string>('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// La fila que muestra la tabla
type TableRow = TournamentFront & {
  facility_name: string
  date_start: string | null
  date_end: string | null
}

// Columnas (tipadas)
const columns = [
  { label: 'Nombre',        field: 'name' },
  { label: 'Facility',      field: 'facility_name' },
  { label: 'Fecha Inicio',  field: 'date_start' },
  { label: 'Fecha Cierre',  field: 'date_end' },
] as const satisfies ReadonlyArray<Column<TableRow>>

// Helpers
const norm = (v: unknown) => String(v ?? '').toLowerCase().trim()

// Fuente de datos
const tournaments = computed<TournamentFront[]>(() => tournamentStore.tournaments || [])

// Error legible
const errorText = computed<string | null>(() => {
  const e = tournamentStore.error as any
  if (!e) return null
  return e.message || e.detail || 'Error al cargar torneos'
})

// Filtrado + presentación
const filteredTournaments = computed<TableRow[]>(() => {
  const qName = norm(searchName.value)
  const qFacility = norm(searchFacility.value)

  const wantActive = statusFilter.value === 'active'
  const wantInactive = statusFilter.value === 'inactive'

  return (tournaments.value || [])
    .filter((t) => {
      if (wantActive && !t.isActive) return false
      if (wantInactive && t.isActive) return false

      const name = norm(t.name)
      const facilityName = norm((t as any).facility_name || t.facility || '')

      const matchesName = qName ? name.includes(qName) : true
      const matchesFacility = qFacility ? facilityName.includes(qFacility) : true
      return matchesName && matchesFacility
    })
    .map((t) => ({
      ...t,
      facility_name: (t as any).facility_name || t.facility || '—',
      date_start: formatDateLongEs(t.date_start),
      date_end: formatDateLongEs(t.date_end),
    }))
})

// Navegación
const goToCreate = () => router.push({ name: 'CreateTournament' })
const editTournament = (id: number) => router.push({ name: 'EditTournament', params: { id } })

// Toggle estado
const toggleTournament = async (row: TournamentFront) => {
  const isActive = !!row.isActive
  const title = isActive ? 'Cerrar torneo' : 'Abrir torneo'
  const text = isActive
    ? '¿Estás seguro de que querés cerrar este torneo? No podrás agregar más categorías ni inscribir jugadores.'
    : '¿Querés volver a abrir este torneo? Podrás gestionar categorías e inscripciones nuevamente.'
  const confirmText = isActive ? 'Sí, cerrar' : 'Sí, abrir'

  const result = await Swal.fire({
    title, text, icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar'
  })
  if (!result.isConfirmed) return

  try {
    await tournamentStore.toggleActive(row.id, !isActive)
    await tournamentStore.fetchTournamentById(row.id)
    showToast({
      message: isActive
        ? 'El torneo fue cerrado correctamente.'
        : 'El torneo fue abierto correctamente.',
      type: 'success'
    })
  } catch (e: any) {
    console.error('No se pudo cambiar el estado del torneo:', e)
    showToast({ message: e?.message || 'Error al cambiar el estado del torneo', type: 'error' })
  }
}

// Delete
const deleteTournament = async (id: number) => {
  const result = await Swal.fire({
    title: 'Finalizar torneo',
    text: '¿Estás seguro de que querés finalizar este torneo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Cancelar'
  })
  if (!result.isConfirmed) return

  try {
    await tournamentStore.deleteTournament(id)
    showToast({ message: 'El torneo fue cerrado correctamente.', type: 'success' })
    await tournamentStore.fetchTournaments()
    router.push({ name: 'IndexTournament' })
  } catch (e: any) {
    showToast({ message: e?.message || 'Error al cerrar el torneo', type: 'error' })
  }
}

// Modal handlers
const viewTournament = (tournament: TournamentFront) => {
  selectedTournament.value = tournament
  categories.value = Array.isArray(tournament.categories) ? tournament.categories : []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTournament.value = null
}

// Bootstrap
onMounted(async () => {
  await tournamentStore.fetchTournaments()
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
