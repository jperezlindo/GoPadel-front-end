<!-- src/views/tournament/ShowTournament.vue -->
<template>
  <div class="max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">Detalles del Torneo</h2>

    <div class="space-y-2 mb-6">
      <p><span class="font-semibold">Nombre:</span> {{ tournament?.name }}</p>
      <p><span class="font-semibold">Fecha de inicio:</span> {{ ensureLongDate(tournament?.date_start) }}</p>
      <p><span class="font-semibold">Fecha de finalización:</span> {{ ensureLongDate(tournament?.date_end) }}</p>
    </div>

    <div v-if="categories.length">
      <h3 class="text-xl font-semibold mb-2">Categorías Participantes</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left border">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2">Nombre</th>
              <th class="p-2">Costo de inscripción ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, index) in categories" :key="index" class="border-t">
              <td class="p-2">{{ cat.name }}</td>
              <td class="p-2">{{ cat.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-gray-500 mt-4">No hay categorías registradas.</div>

    <!-- Botones de acción -->
    <div v-if="editable" class="mt-6 flex flex-col sm:flex-row gap-2">
      <button
        @click="handleCancel"
        class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full"
      >
        Cancelar
      </button>
      <button
        @click="handleConfirm"
        class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        {{ isEditMode ? 'Actualizar Torneo' : 'Crear Torneo' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateLongEs } from '@/utils/dateUtils'
import type { TournamentFront, TournamentCategoryFront } from '@/services/tournamentApi'

interface Props {
  tournament: TournamentFront | null
  categories: TournamentCategoryFront[]
  editable?: boolean
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tournament: null,
  categories: () => [],
  editable: false,
  isEditMode: false,
})

const emit = defineEmits<{
  (e: 'detailsConfirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => emit('detailsConfirm')
const handleCancel = () => emit('cancel')

const ensureLongDate = (val: string | null | undefined) => {
  if (typeof val === 'string' && /\d{1,2} de \w+ de \d{4}/i.test(val)) {
    return val
  }
  return formatDateLongEs(val ?? null)
}
</script>
