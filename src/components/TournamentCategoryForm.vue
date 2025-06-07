<template>
    <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <h2 class="text-2xl font-bold mb-4">
        {{ isEditMode ? 'Editar Categoría del Torneo' : 'Agregar Categoría al Torneo' }}
        </h2>
        <form @submit.prevent="handleAddCategory" class="space-y-4">
            <div>
                <label class="label">Nombre de la categoría</label>
                <input v-model="localForm.name" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Costo de inscripción ($)</label>
                <input v-model.number="localForm.registration_fee" type="number" min="0" class="input" required />
            </div>

            <div>
                <label class="label">Categoría</label>
                <select v-model="localForm.category_id" class="input" required>
                    <option value="" disabled>Seleccionar categoría</option>
                    <option v-for="c in availableCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                {{ editIndex !== null ? 'Guardar Cambios' : 'Agregar Categoría' }}
            </button>
        </form>

        <!-- Tabla de categorías agregadas -->
        <div v-if="localCategories.length" class="mt-6">
            <h3 class="text-xl font-semibold mb-2">Categorías del Torneo</h3>
            <table class="w-full text-sm text-left border">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2">Nombre</th>
                        <th class="p-2">Costo ($)</th>
                        <th class="p-2">Categoría</th>
                        <th class="p-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(cat, index) in localCategories" :key="index" class="border-t">
                    <td class="p-2">{{ cat.name }}</td>
                    <td class="p-2">{{ cat.registration_fee }}</td>
                    <td class="p-2">{{ getCategoryName(cat.category_id) }}</td>
                    <td class="p-2 text-center space-x-2">
                        <button @click="editCategory(index)" class="text-blue-600 hover:underline">Editar</button>
                        <button @click="removeCategory(index)" class="text-red-600 hover:underline">Eliminar</button>
                    </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Botón de enviar al padre -->
        <div v-if="localCategories.length" class="mt-6">
            <button @click="finalizeAndSubmit"
                class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                Confirmar Categorías
            </button>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  availableCategories: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['submit-categories'])

const localForm = reactive({
  name: '',
  registration_fee: 0,
  category_id: '', 
  isActive: true
})

const localCategories = ref([])
const editIndex = ref(null)

watch(() => props.categories, (newVal) => {
  localCategories.value = [...newVal]
}, { immediate: true, deep: true })

const handleAddCategory = () => {
  if (!localForm.category_id) {
    alert('Por favor seleccione una categoría.')
    return
  }

  const newCategory = { ...localForm }
  if (editIndex.value !== null) {
    localCategories.value[editIndex.value] = newCategory
  } else {
    localCategories.value.push(newCategory)
  }

  resetForm()
}

const editCategory = (index) => {
  Object.assign(localForm, localCategories.value[index])
  editIndex.value = index
}

const removeCategory = (index) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    localCategories.value.splice(index, 1)
    if (editIndex.value === index) resetForm()
  }
}

const finalizeAndSubmit = () => {
  emit('submit-categories', localCategories.value)
}

const resetForm = () => {
  Object.assign(localForm, {
    name: '',
    registration_fee: 0,
    category_id: ''
  })
  editIndex.value = null
}

const getCategoryName = (id) => {
  return props.availableCategories.find((cat) => cat.id === id)?.name || 'Sin nombre'
}
</script>


<style scoped>
.input {
    @apply mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400;
}

.label {
    @apply block text-sm font-medium text-gray-700;
}
</style>
