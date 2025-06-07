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
        <input v-model="localForm.start_date" type="date" class="input" required />
      </div>

      <div>
        <label class="label">Fecha de finalización</label>
        <input v-model="localForm.end_date" type="date" class="input" required />
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          @click="handleCancel"
          class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {{ isEditMode ? 'Guardar Cambios' : 'Registrar Torneo' }}
        </button>
      </div>
    </form>

  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      start_date: '',
      end_date: '',
    })
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['submit', 'update:modelValue', 'cancel'])
const localForm = reactive({ ...props.modelValue })

const emitSubmit = () => {
  if (new Date(localForm.start_date) > new Date(localForm.end_date)) {
    alert('La fecha de inicio no puede ser posterior a la fecha de finalización.')
    return
  }

  emit('submit', { ...localForm })
}

const handleCancel = () => emit('cancel')

watch(() => props.modelValue, (newVal) => {
  Object.assign(localForm, newVal)
}, { deep: true })

watch(localForm, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })
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
