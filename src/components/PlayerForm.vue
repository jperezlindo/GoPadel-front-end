<template>
    <div class="form-container">
        <h2 class="text-2xl font-bold mb-4">
            {{ isEditMode ? 'Editar Jugador' : 'Registrar Jugador' }}
        </h2>

        <form @submit.prevent="emitSubmit" class="space-y-4">
            <div>
                <label class="label">Fecha Nacimiento</label>
                <input v-model="localForm.birthday" type="date" class="input" required />
            </div>

            <div>
                <label class="label">Apodo</label>
                <input v-model="localForm.nickname" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Posición</label>
                <select v-model="localForm.position" class="input" required>
                    <option value="" disabled>Seleccionar posición</option>
                    <option value="DRIVE">Drive</option>
                    <option value="REVEZ">Revés</option>
                    <option value="AMBOS">Ambos</option>
                </select>
            </div>

            <div>
                <label class="label">Nivel</label>
                <input v-model="localForm.level" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Puntos</label>
                <input v-model.number="localForm.points" type="number" min="0" class="input" required />
            </div>

            <div>
                <label class="label">Categoría</label>
                <select v-model="localForm.category_id" class="input" required>
                    <option value="" disabled>Seleccionar categoría</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>

            <div>
                <label class="label">Foto de perfil</label>
                <input type="file" accept="image/*" @change="handleImageUpload" class="input" />
                <div v-if="imagePreview" class="mt-4 flex justify-center">
                    <img :src="imagePreview" alt="Preview" class="w-24 h-24 rounded-full object-cover shadow" />
                </div>
            </div>

            <button type="submit" class="btn-primary">
                {{ isEditMode ? 'Guardar Cambios' : 'Registrar Jugador' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            nickname: '',
            position: '',
            level: '',
            points: 0,
            category_id: '',
            image: null,
            birthday: ''
        })
    },
    categories: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['submit'])

const localForm = reactive({ ...props.modelValue })

const imagePreview = ref(localForm.image || null)

watch(() => props.modelValue, (newVal) => {
    Object.assign(localForm, newVal)
    imagePreview.value = newVal.image || null
})

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.size < 1 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = () => {
            imagePreview.value = reader.result
            localForm.image = reader.result
        }
        reader.readAsDataURL(file)
    } else {
        alert('La imagen debe pesar menos de 1MB.')
    }
}

const emitSubmit = () => {
    if (!localForm.category_id || !localForm.position) {
        alert('Por favor complete todos los campos obligatorios.')
        return
    }

    emit('submit', { ...localForm })
}

const isEditMode = computed(() => !!props.modelValue?.id)
</script>
