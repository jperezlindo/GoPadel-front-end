<template>
    <!-- Formulario para registrar o editar un complejo de pádel -->
    <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <h2 class="text-2xl font-bold mb-4">
            {{ isEditMode ? 'Editar Complejo de Pádel' : 'Registrar Complejo de Pádel' }}
        </h2>
        <form @submit.prevent="emitSubmit" class="space-y-4">
            <div>
                <label class="label">Nombre del complejo</label>
                <input v-model="localForm.name" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Dirección</label>
                <input v-model="localForm.address" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Celular</label>
                <input v-model="localForm.movil" type="tel" class="input" required />
            </div>

            <div>
                <label class="label">Email</label>
                <input v-model="localForm.email" type="email" class="input" required />
            </div>

            <div>
                <label class="label">Ubicación</label>
                <input v-model="localForm.location" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Número de canchas</label>
                <input v-model.number="localForm.courts_number" type="number" min="1" class="input" required />
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                {{ isEditMode ? 'Guardar Cambios' : 'Registrar Complejo' }}
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'

type FacilityFormModel = {
    id?: number
    name: string
    address: string
    movil: string
    email: string
    location: string
    courts_number: number | null
}

const props = withDefaults(
    defineProps < {
        modelValue: FacilityFormModel
    } > (),
    {
        modelValue: () => ({
            name: '',
            address: '',
            movil: '',
            email: '',
            location: '',
            courts_number: null,
        }),
    }
)

const emit = defineEmits < {
  (e: 'submit', payload: FacilityFormModel): void
}> ()

// Estado local editable
const localForm = reactive < FacilityFormModel > ({ ...props.modelValue })

// Mantengo sincronización desde el padre
watch(
    () => props.modelValue,
    (newVal) => {
        Object.assign(localForm, newVal)
    }
)

// Emitir submit con el payload actual
const emitSubmit = () => {
    emit('submit', { ...localForm })
}

// Modo edición si llega id en modelValue
const isEditMode = computed < boolean > (() => !!(props.modelValue as FacilityFormModel)?.id)
</script>

<style scoped>
.input {
    @apply mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400;
}

.label {
    @apply block text-sm font-medium text-gray-700;
}
</style>
