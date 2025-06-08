<template>
    <div class="form-container">
        <h2 class="text-2xl font-bold mb-4">{{ form.id ? 'Editar Categoría' : 'Registrar Categoría' }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-6 rounded-2xl shadow-md">
            <div>
                <label class="block mb-1 font-medium">Nombre</label>
                <input v-model="form.name" type="text" class="input" required />
            </div>

            <div class="flex justify-end gap-4 pt-4">
                <button type="button" @click="handleCancel" class="btn-secondary">Cancelar</button>
                <button type="submit" class="btn-primary">
                    {{ form.id ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
    Object.assign(form, newVal)
})

const handleSubmit = () => {
    emit('submit', { ...form })
}

const handleCancel = async () => {
    const result = await Swal.fire({
        title: 'Cancelar operación',
        text: '¿Estás seguro de que querés cancelar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver'
    })
    if (result.isConfirmed) emit('cancel')
}
</script>

<style scoped>
.input {
    @apply w-full px-4 py-2 border rounded-lg shadow-sm;
}

.btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700;
}

.btn-secondary {
    @apply bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500;
}
</style>
