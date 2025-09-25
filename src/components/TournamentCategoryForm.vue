<!-- TournamentCategory Form -->
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
        <input v-model.number="localForm.price" type="number" min="0" class="input" required />
      </div>

      <div>
        <label class="label">Categoría</label>
        <select v-model.number="localForm.category_id" class="input" required>
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
            <td class="p-2">{{ cat.price }}</td>
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
    <div class="flex mt-6 gap-2">
      <button type="button" @click="handleCancel"
        class="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition">
        Cancelar
      </button>

      <button v-if="localCategories.length" @click="finalizeAndSubmit"
        class="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

/**
 * Tipos locales para tipado fuerte sin cambiar el contrato.
 */
type SimpleCategory = { id: number; name: string }
type TournamentCategoryRow = {
  name: string
  price: number
  // El select inicia en '' y luego pasa a number -> uso unión para respetar el flujo actual.
  category_id: number | ''
  isActive?: boolean
}

const props = withDefaults(defineProps < {
  availableCategories: SimpleCategory[]
  categories: TournamentCategoryRow[]
  isEditMode?: boolean
} > (), {
  availableCategories: () => [],
  categories: () => [],
  isEditMode: false,
})

const emit = defineEmits < {
  (e: 'submit-categories', payload: TournamentCategoryRow[]): void
  (e: 'cancel'): void
}> ()

/**
 * Estado local del form y la tabla de categorías seleccionadas.
 * Mantengo campos existentes sin agregar ni quitar.
 */
const localForm = reactive < TournamentCategoryRow > ({
  name: '',
  price: 0,
  category_id: '',
  isActive: true,
})

const localCategories = ref < TournamentCategoryRow[] > ([])
const editIndex = ref < number | null > (null)

/**
 * Sincronizo categorías iniciales desde props hacia el estado local.
 */
watch(
  () => props.categories,
  (newVal) => {
    localCategories.value = [...newVal]
  },
  { immediate: true, deep: true }
)

/**
 * Agregar/guardar categoría en la lista.
 */
const handleAddCategory = () => {
  if (localForm.category_id === '') {
    alert('Por favor seleccione una categoría.')
    return
  }

  const newCategory: TournamentCategoryRow = { ...localForm }

  if (editIndex.value !== null) {
    localCategories.value[editIndex.value] = newCategory
  } else {
    localCategories.value.push(newCategory)
  }

  resetForm()
}

/**
 * Editar una fila existente.
 */
const editCategory = (index: number) => {
  Object.assign(localForm, localCategories.value[index])
  editIndex.value = index
}

/**
 * Eliminar una fila.
 */
const removeCategory = (index: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
    localCategories.value.splice(index, 1)
    if (editIndex.value === index) resetForm()
  }
}

/**
 * Enviar al padre la lista final de categorías.
 */
const finalizeAndSubmit = () => {
  emit('submit-categories', localCategories.value)
}

/**
 * Reset del formulario a su estado inicial.
 */
const resetForm = () => {
  Object.assign(localForm, {
    name: '',
    price: 0,
    category_id: '' as number | '',
    isActive: true,
  })
  editIndex.value = null
}

/**
 * Obtener el nombre de la categoría a partir de su id.
 */
const getCategoryName = (id: number | ''): string => {
  if (id === '') return 'Sin nombre'
  return props.availableCategories.find((cat) => cat.id === id)?.name || 'Sin nombre'
}

const handleCancel = () => {
  emit('cancel')
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
