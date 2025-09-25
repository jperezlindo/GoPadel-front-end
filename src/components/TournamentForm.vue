<!-- Tournament Form Component -->
<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">{{ isEditMode ? 'Editar Torneo' : 'Registrar Torneo' }}</h2>

    <form @submit.prevent="emitSubmit" class="space-y-4">
      <div>
        <label class="label">Nombre del torneo</label>
        <input v-model="localForm.name" type="text" class="input" required />
      </div>

      <div>
        <label class="label">Fecha de inicio</label>
        <input v-model="localForm.date_start" type="date" class="input" required />
      </div>

      <div>
        <label class="label">Fecha de finalización</label>
        <input v-model="localForm.date_end" type="date" class="input" required />
      </div>

      <div class="flex gap-2">
        <button type="button" @click="handleCancel"
          class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full">
          Cancelar
        </button>

        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
          Siguiente
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

/**
 * Mantengo el contrato de props/emits y tipado fuerte en TS.
 * Se corrige la validación usando las claves reales: date_start y date_end.
 */

type TournamentFormModel = {
  name: string
  date_start: string // formato 'YYYY-MM-DD'
  date_end: string   // formato 'YYYY-MM-DD'
}

const props = withDefaults(defineProps < {
  modelValue: TournamentFormModel
  isEditMode?: boolean
} > (), {
  modelValue: () => ({
    name: '',
    date_start: '',
    date_end: '',
  }),
  isEditMode: false,
})

const emit = defineEmits < {
  (e: 'submit', payload: TournamentFormModel): void
  (e: 'update:modelValue', payload: TournamentFormModel): void
    (e: 'cancel'): void
}> ()

// Uso un estado local reactivo para editar sin mutar directamente el v-model del padre.
const localForm = reactive < TournamentFormModel > ({ ...props.modelValue })

// Valido fechas y emito el submit manteniendo el contrato actual
const emitSubmit = () => {
  // Convierto a Date solo si hay valores
  if (localForm.date_start && localForm.date_end) {
    const start = new Date(localForm.date_start)
    const end = new Date(localForm.date_end)
    if (start > end) {
      alert('La fecha de inicio no puede ser posterior a la fecha de finalización.')
      return
    }
  }
  emit('submit', { ...localForm })
}

// Emite cancel sin efectos colaterales
const handleCancel = () => emit('cancel')

// Sincronizo cambios desde el padre hacia el formulario local
watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(localForm, newVal)
  },
  { deep: true }
)

// Propago cambios locales hacia el v-model del padre
watch(
  localForm,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true }
)
</script>

<style scoped>
.input {
  @apply mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400;
}

.label {
  @apply block text-sm font-medium text-gray-700;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
