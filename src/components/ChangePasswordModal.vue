<!-- src/components/ChangePasswordModal.vue -->
<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>

    <div class="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6">
      <h3 class="text-lg font-semibold mb-4">Cambiar contraseña</h3>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div v-if="requireOld">
          <label class="block text-sm font-medium text-gray-700">Contraseña actual</label>
          <input
            v-model="form.old_password"
            :type="show ? 'text' : 'password'"
            autocomplete="current-password"
            class="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            v-model="form.new_password"
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="6"
            class="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Repetir nueva contraseña</label>
          <div class="relative">
            <input
              v-model="form.confirm"
              :type="show ? 'text' : 'password'"
              autocomplete="new-password"
              minlength="6"
              class="mt-1 w-full rounded-lg border px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
              @click="show = !show"
            >
              {{ show ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>

        <p v-if="inlineError" class="text-sm text-red-600">{{ inlineError }}</p>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 bg-gray-200 text-gray-800 rounded-lg py-2 hover:bg-gray-300"
            @click="close"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:opacity-60"
            :disabled="loading"
          >
            <span v-if="!loading">Guardar</span>
            <span v-else>Guardando…</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { changePassword } from '@/services/userApi'
import { showToast } from '@/utils/alerts'

const props = defineProps<{
  modelValue: boolean
  userId: number
  requireOld?: boolean    // por defecto true; si en algún lado querés modo admin, setealo a false
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'changed'): void
}>()

const form = reactive({
  old_password: '',
  new_password: '',
  confirm: '',
})

const show = ref(false)
const loading = ref(false)
const inlineError = ref<string | null>(null)

const close = () => {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (open) => {
  if (open) {
    form.old_password = ''
    form.new_password = ''
    form.confirm = ''
    inlineError.value = null
    show.value = false
  }
})

const onSubmit = async () => {
  inlineError.value = null

  if (form.new_password.length < 6) {
    inlineError.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (form.new_password !== form.confirm) {
    inlineError.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    loading.value = true
    const payload: { old_password?: string; new_password: string } = {
      new_password: form.new_password,
    }
    if (props.requireOld !== false) {
      payload.old_password = form.old_password
    }

    await changePassword(props.userId, payload)
    showToast({ type: 'success', message: 'Contraseña actualizada' })
    emit('changed')
    close()
  } catch (e: any) {
    const msg = e?.message || 'No se pudo actualizar la contraseña'
    inlineError.value = msg
    showToast({ type: 'error', message: msg })
  } finally {
    loading.value = false
  }
}
</script>
