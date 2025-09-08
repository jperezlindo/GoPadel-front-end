<template>
    <div class="max-w-2xl mx-auto p-2 sm:p-4">
        <h2 class="text-2xl font-bold mb-4">{{ form.id ? 'Editar Usuario' : 'Registrar Usuario' }}</h2>

        <!-- Error global opcional -->
        <div v-if="(errors?.non_field_errors && errors.non_field_errors.length) || (errors?.detail && errors.detail.length)"
            class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <div v-for="(m, i) in (errors.non_field_errors || errors.detail)" :key="i">{{ m }}</div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-4 sm:p-6 rounded-2xl shadow-md">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-1 font-medium">Nombre</label>
                    <input v-model="form.name" type="text" :class="inputClass('name')" required />
                    <FieldErrors :messages="fieldErrors('name')" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Apellido</label>
                    <input v-model="form.last_name" type="text" :class="inputClass('last_name')" required />
                    <FieldErrors :messages="fieldErrors('last_name')" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Email</label>
                    <input v-model="form.email" type="email" :class="inputClass('email')" required />
                    <FieldErrors :messages="fieldErrors('email')" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Fecha de nacimiento</label>
                    <input v-model="form.birth_day" type="date" :class="inputClass('birth_day')" />
                    <FieldErrors :messages="fieldErrors('birth_day')" />
                </div>

                <!-- Sólo creación -->
                <template v-if="!form.id">
                    <div>
                        <label class="block mb-1 font-medium">Contraseña</label>
                        <input v-model="form.password" type="password" :class="inputClass('password')" required />
                        <FieldErrors :messages="fieldErrors('password')" />
                    </div>

                    <div>
                        <label class="block mb-1 font-medium">Confirmar contraseña</label>
                        <input v-model="confirmPassword" type="password"
                            class="w-full px-4 py-2 border rounded-lg shadow-sm border-gray-300 focus:ring-blue-200"
                            required />
                    </div>

                    <div class="sm:col-span-2">
                        <label class="block mb-1 font-medium">¿Activo?</label>
                        <select v-model="form.isActive" :class="inputClass('is_active')">
                            <option :value="true">Sí</option>
                            <option :value="false">No</option>
                        </select>
                        <FieldErrors :messages="fieldErrors('is_active')" />
                    </div>
                </template>

                <!-- Imagen -->
                <div class="sm:col-span-2">
                    <label class="block mb-1 font-medium">Foto de perfil</label>
                    <input type="file" accept="image/*" @change="handleImageUpload" :class="inputClass('avatar')" />
                    <FieldErrors :messages="fieldErrors('avatar')" />
                    <div v-if="form.avatar" class="mt-2 flex justify-center">
                        <img :src="form.avatar" alt="Previsualización"
                            class="w-24 h-24 rounded-full object-cover border" />
                    </div>
                </div>
            </div>

            <!-- Botones verdes, full width -->
            <div class="flex gap-2">
                <button type="button" @click="handleCancel" class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full">
                    Cancelar
                </button>

                <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                    {{ form.id ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, watch, h, defineComponent } from 'vue'
import Swal from 'sweetalert2'

// Props / Emits
const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    // Estructura esperada: { campo: string[], non_field_errors?: string[], detail?: string[] }
    errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit', 'cancel'])

// ------ Inline component: FieldErrors ------
const FieldErrors = defineComponent({
  name: 'FieldErrors',
  props: {
    messages: { type: Array, default: () => [] }
  },
  setup(props) {
    return () => {
      const msgs = props.messages || []
      if (!msgs.length) return null
      return h(
        'ul',
        { class: 'mt-1 space-y-0.5' },
        msgs.map((m, i) =>
          h('li', { key: i, class: 'text-sm text-red-600' }, String(m))
        )
      )
    }
  }
})

// ------ Form logic ------
const normalizeIn = (val = {}) => ({
    id: val.id ?? null,
    name: val.name ?? '',
    last_name: val.last_name ?? val.lastname ?? '',
    email: val.email ?? '',
    birth_day: val.birth_day ?? null, // 'YYYY-MM-DD'
    password: val.password ?? '',     // sólo creación
    isActive: val.isActive ?? true,
    avatar: val.avatar ?? val.image ?? '',
    facility_id: val.facility_id ?? null,
    city_id: val.city_id ?? null,
    rol_id: val.rol_id ?? null,
})

const form = reactive(normalizeIn(props.modelValue))
const confirmPassword = ref('')

// Sync con el padre
watch(() => props.modelValue, (nv) => Object.assign(form, normalizeIn(nv)))

// Errores UI
const hasError = (field) => Array.isArray(props.errors?.[field]) && props.errors[field].length > 0
const inputClass = (field) => [
    'w-full px-4 py-2 border rounded-lg shadow-sm',
    hasError(field) ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
].join(' ')
const fieldErrors = (field) => props.errors?.[field] ?? []

// Submit
const handleSubmit = () => {
    if (!form.id) {
        if (form.password !== confirmPassword.value) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña no coincide',
                text: 'La confirmación de la contraseña no es correcta.',
            })
            return
        }
        if (!form.password || form.password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña inválida',
                text: 'La contraseña debe tener al menos 6 caracteres.',
            })
            return
        }
    }

    const payload = {
        id: form.id ?? undefined,
        name: (form.name ?? '').trim(),
        last_name: (form.last_name ?? '').trim(),
        email: (form.email ?? '').trim(),
        birth_day: form.birth_day || null,
        password: form.id ? undefined : (form.password ?? ''), // sólo al crear
        isActive: !!form.isActive,
        avatar: form.avatar || '',
        facility_id: form.facility_id ?? null,
        city_id: form.city_id ?? null,
        rol_id: form.rol_id ?? null,
    }

    emit('submit', payload)
}

const handleCancel = async () => {
    const result = await Swal.fire({
        title: 'Cancelar operación',
        text: '¿Estás seguro de que querés cancelar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        reverseButtons: true,
    })
    if (result.isConfirmed) emit('cancel')
}

const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => { form.avatar = e.target?.result }
    reader.readAsDataURL(file)
}
</script>

<style scoped></style>
