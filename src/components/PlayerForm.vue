<template>
  <!-- Formulario para crear o editar un jugador -->
  <div class="max-w-2xl mx-auto p-2 sm:p-4">
    <h2 class="text-2xl font-bold mb-4">
      {{ isEditMode ? 'Editar Jugador' : 'Registrar Jugador' }}
    </h2>

    <form @submit.prevent="emitSubmit" class="space-y-4">
      <div>
        <label class="label">Nickname</label>
        <input
          v-model="localForm.nickname"
          type="text"
          class="w-full px-4 py-2 border rounded-lg shadow-sm"
          required
        />
      </div>

      <div>
        <label class="label">Posición</label>
        <select v-model="localForm.position" class="w-full px-4 py-2 border rounded-lg shadow-sm">
          <option value="" disabled>Seleccionar posición</option>
          <option v-for="position in positions" :key="position" :value="position">
            {{ position }}
          </option>
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
        <input
          v-model="localForm.level"
          type="text"
          class="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <div>
        <label class="label">Puntos</label>
        <input
          v-model.number="localForm.points"
          type="number"
          min="0"
          class="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          @click="handleCancel"
          class="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold
                 bg-gray-500 hover:bg-gray-600 text-white transition focus:outline-none
                 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold
                 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition focus:outline-none
                 focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ localForm.id ? 'Actualizar' : 'Registrar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

import { usePlayerStore } from '@/stores/usePlayerStore'
import { useCategoryStore } from '@/stores/useCategoryStore'

/**
 * Tipos mínimos basados en el contrato actual.
 * Importante: mantengo los campos existentes sin agregar ni quitar.
 * Nota: el prop original trae `caegory_id`. Mantengo compat agregando
 * una sincronización hacia `category_id` para que el form funcione,
 * sin eliminar el campo original.
 */
type Category = { id: number; name: string }
type PlayerFormModel = {
  id?: number | string
  nickname: string
  position: string
  level: string | number
  points: number
  partner: unknown | null
  user_id: number
  // Mantengo el typo original y agrego el utilizado por el componente
  caegory_id?: number
  category_id?: number | ''
  isActive: boolean
}

const categoryStore = useCategoryStore()
const playerStore = usePlayerStore()

const positions = ref<string[]>([])
const categories = ref<Category[]>([])

const props = defineProps<{
  modelValue: PlayerFormModel
}>()

const emit = defineEmits<{
  (e: 'submit', payload: PlayerFormModel): void
  (e: 'cancel'): void
}>()

// Estado local editable
const localForm = reactive<PlayerFormModel>({
  id: props.modelValue?.id ?? '',
  nickname: props.modelValue?.nickname ?? '',
  position: props.modelValue?.position ?? '',
  level: props.modelValue?.level ?? 0,
  points: props.modelValue?.points ?? 0,
  partner: props.modelValue?.partner ?? null,
  user_id: props.modelValue?.user_id ?? 0,
  // sincronizo typo → category_id para que el select funcione
  caegory_id: props.modelValue?.caegory_id,
  category_id: props.modelValue?.category_id ?? (props.modelValue?.caegory_id ?? ''),
  isActive: props.modelValue?.isActive ?? true,
})

// Sync descendente desde el padre
watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(localForm, newVal)
    // vuelvo a mapear para asegurar el select
    if (newVal?.category_id === undefined && newVal?.caegory_id !== undefined) {
      localForm.category_id = newVal.caegory_id
    }
  }
)

onMounted(() => {
  positions.value = playerStore.positions as string[]
  categories.value = categoryStore.categories as Category[]
})

const emitSubmit = () => {
  // Validación mínima
  if (!localForm.category_id || !localForm.nickname) {
    alert('Por favor complete todos los campos obligatorios.')
    return
  }

  // Mantengo compat: reflejo category_id → caegory_id antes de emitir
  if (typeof localForm.category_id === 'number') {
    localForm.caegory_id = localForm.category_id
  }

  emit('submit', { ...localForm })
}

const isEditMode = computed<boolean>(() => !!props.modelValue?.id)

const handleCancel = async () => {
  const result = await Swal.fire({
    title: 'Cancelar operación',
    text: '¿Estás seguro de que querés cancelar?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver',
  })
  if (result.isConfirmed) emit('cancel')
}
</script>

<style scoped></style>
