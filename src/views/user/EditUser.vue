<template>
  <div>
    <UserForm
      v-if="user"
      :modelValue="user"
      :errors="formErrors"
      @submit="handleUpdate"
      @cancel="cancelEdit"
    />
    <p v-else class="text-gray-500">Cargando usuario...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { showToast } from '@/utils/alerts'
import { useUserStore } from '@/stores/useUserStore'
import UserForm from '@/components/UserForm.vue'
import type { UserFront } from '@/services/userApi'
import { useFormErrors } from '@/composables/useFormErrors'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { errors: formErrors, globalError, setFromApiError, clear } = useFormErrors()

const ROLE_ADMIN = 1
const user = ref<UserFront | null>(null)

onMounted(async () => {
  const id = Number(route.params.id as string)
  if (!Number.isFinite(id)) {
    showToast({ type: 'error', message: 'ID inválido.' })
    router.push({ name: 'IndexUser' })
    return
  }
  const found = userStore.getUserById(id)
  if (found) {
    user.value = { ...found }
    return
  }
  try {
    const fetched = await userStore.fetchUserById(id)
    if (!fetched) {
      showToast({ type: 'error', message: 'Usuario no encontrado.' })
      router.push({ name: 'IndexUser' })
      return
    }
    user.value = { ...fetched }
  } catch {
    showToast({ type: 'error', message: 'No se pudo cargar el usuario.' })
    router.push({ name: 'IndexUser' })
  }
})

const handleUpdate = async (updatedData: Partial<UserFront> & { password?: string }) => {
  clear()

  const result = await Swal.fire({
    title: 'Confirmar edición',
    text: '¿Deseás guardar los cambios del usuario?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return

  try {
    const saved = await userStore.updateUser({
      ...updatedData,
      id: updatedData.id ?? user.value?.id,
    })
    showToast({ type: 'success', message: 'Usuario actualizado correctamente.' })
    const rolId = saved?.rol_id ?? user.value?.rol_id
    router.push({ name: rolId === ROLE_ADMIN ? 'Home' : 'IndexUser' })
  } catch (e) {
    setFromApiError(e)
    showToast({ type: 'error', message: globalError.value ?? 'No se pudo actualizar el usuario.' })
  }
}
</script>

<template>
  <div>
    <UserForm v-if="user" :modelValue="user" :errors="formErrors" @submit="handleUpdate"
      @cancel="() => router.push({ name: 'IndexUser' })" />
    <p v-else class="text-gray-500">Cargando usuario...</p>
  </div>
</template>
