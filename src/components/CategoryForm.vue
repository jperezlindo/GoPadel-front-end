<template>
    <div class="form-container">
        <h2 class="text-2xl font-bold mb-4">
            {{ isEditMode ? 'Editar Categoría' : 'Registrar Categoría' }}
        </h2>

        <form @submit.prevent="submitForm" class="space-y-4">
            <div>
                <label class="label">Nombre</label>
                <input v-model="form.name" type="text" class="input" required />
            </div>

            <button type="submit" class="btn-primary">
                {{ isEditMode ? 'Guardar Cambios' : 'Registrar Categoría' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit'])

const form = reactive({
    id: props.modelValue?.id || null,
    name: props.modelValue?.name || ''
})

watch(() => props.modelValue, (newVal) => {
    form.id = newVal?.id || null
    form.name = newVal?.name || ''
})

const isEditMode = computed(() => !!form.id)

function submitForm() {
    emit('submit', { ...form })
}
</script>
