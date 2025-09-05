<template>
    <div class="max-w-2xl mx-auto p-2 sm:p-4">
        <h2 class="text-2xl font-bold mb-4">
            {{ isEditMode ? 'Editar Jugador' : 'Registrar Jugador' }}
        </h2>

        <form @submit.prevent="emitSubmit" class="space-y-4">
            <div>
                <label class="label">Nickname</label>
                <input v-model="localForm.nickname" type="text" class="w-full px-4 py-2 border rounded-lg shadow-sm"
                    required />
            </div>

            <div>
                <label class="label">Fecha Nacimiento</label>
                <input v-model="localForm.birthday" type="date" class="w-full px-4 py-2 border rounded-lg shadow-sm" />
            </div>

            <div>
                <label class="label">Posición</label>
                <select v-model="localForm.position" class="w-full px-4 py-2 border rounded-lg shadow-sm">
                    <option value="" disabled>Seleccionar posición</option>
                    <option v-for="position in positions" :value="position">{{ position }}</option>
                </select>
            </div>

            <div>
                <label class="label">Categoría</label>
                <select v-model="localForm.category_id" class="w-full px-4 py-2 border rounded-lg shadow-sm" required>
                    <option value="" disabled>Seleccionar categoría</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>

            <div>
                <label class="label">Nivel</label>
                <input v-model="localForm.level" type="text" class="w-full px-4 py-2 border rounded-lg shadow-sm" />
            </div>

            <div>
                <label class="label">Puntos</label>
                <input v-model.number="localForm.points" type="number" min="0"
                    class="w-full px-4 py-2 border rounded-lg shadow-sm" />
            </div>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button type="button" @click="handleCancel" 
                class="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold
           bg-gray-500 hover:bg-gray-600 text-white transition focus:outline-none
           focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                    Cancelar
                </button>

                <button type="submit" class="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold
           bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition focus:outline-none
           focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed">
                    {{ localForm.id ? 'Actualizar' : 'Registrar' }}
                </button>
            </div>

        </form>
    </div>
</template>

<script setup>
import { reactive, watch, computed, ref, onMounted } from 'vue'

import Swal from 'sweetalert2'

import { usePlayerStore } from '@/stores/usePlayerStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

const categoryStore = useCategoryStore()
const playerStore = usePlayerStore()

const positions = ref([])
const categories = ref([])

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            id: '',
            nickname: '',
            birthday: '',
            position: '',
            level: 0,
            points: 0,
            partner: null,
            user_id: 0,
            caegory_id: 0,
            isActive: true,
        })
    },
})

const emit = defineEmits(['submit', 'cancel'])

const localForm = reactive({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
    Object.assign(localForm, newVal)
})

onMounted(() => {
    positions.value = playerStore.positions
    categories.value = categoryStore.categories
})
const emitSubmit = () => {
    if (!localForm.category_id || !localForm.nickname) {
        alert('Por favor complete todos los campos obligatorios.')
        return
    }

    emit('submit', { ...localForm })
}

const isEditMode = computed(() => !!props.modelValue?.id)

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
/* Sin @apply, las clases Tailwind están en el HTML */
</style>
