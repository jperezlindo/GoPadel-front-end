<template>
    <div class="max-w-2xl mx-auto p-2 sm:p-4">
        <h2 class="text-2xl font-bold mb-4">
            {{ form.id ? 'Editar Usuario' : 'Registrar Usuario' }}
        </h2>

        <!-- Error global opcional dentro del form -->
        <div v-if="globalError" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {{ globalError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-4 sm:p-6 rounded-2xl shadow-md">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Nombre -->
                <div>
                    <label class="block mb-1 font-medium">Nombre</label>
                    <input v-model="form.name" type="text" :class="inputClass('name')" required />
                    <FieldError :message="fieldError('name')" />
                </div>

                <!-- Apellido -->
                <div>
                    <label class="block mb-1 font-medium">Apellido</label>
                    <input v-model="form.last_name" type="text" :class="inputClass('last_name')" required />
                    <FieldError :message="fieldError('last_name')" />
                </div>

                <!-- Email -->
                <div>
                    <label class="block mb-1 font-medium">Email</label>
                    <input v-model="form.email" type="email" :class="inputClass('email')" required />
                    <FieldError :message="fieldError('email')" />
                </div>

                <!-- Fecha de nacimiento -->
                <div>
                    <label class="block mb-1 font-medium">Fecha de nacimiento</label>
                    <input v-model="form.birth_day" type="date" :class="inputClass('birth_day')" />
                    <FieldError :message="fieldError('birth_day')" />
                </div>

                <!-- Sólo CREACIÓN -->
                <template v-if="!form.id">
                    <div>
                        <label class="block mb-1 font-medium">Contraseña</label>
                        <input v-model="form.password" type="password" :class="inputClass('password')" required />
                        <FieldError :message="fieldError('password')" />
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
                        <FieldError :message="fieldError('is_active')" />
                    </div>
                </template>

                <!-- Imagen -->
                <div class="sm:col-span-2">
                    <label class="block mb-1 font-medium">Foto de perfil</label>
                    <input type="file" accept="image/*" @change="handleImageUpload" :class="inputClass('avatar')" />
                    <FieldError :message="fieldError('avatar')" />
                    <div v-if="form.avatar" class="mt-2 flex justify-center">
                        <img :src="form.avatar" alt="Previsualización"
                            class="w-24 h-24 rounded-full object-cover border" />
                    </div>
                </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-2">
                <button type="button" @click="handleCancel"
                    class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full">
                    Cancelar
                </button>

                <button type="submit"
                    class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                    {{ form.id ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, h, defineComponent } from 'vue'
import Swal from 'sweetalert2'
import type { UserFront } from '@/services/userApi'

// ===== Tipos de props =====
type FlatErrors = Record<string, string | undefined>
type FormModel = Partial<UserFront> & { password?: string }

const props = withDefaults(defineProps < {
    modelValue: FormModel
  errors?: FlatErrors
  /** Mensaje global opcional (ya aplanado por el padre) */
  globalError?: string | null
} > (), {
    errors: () => ({}),
    globalError: null,
})

const emit = defineEmits < {
  (e: 'submit', payload: FormModel): void
    (e: 'cancel'): void
}> ()

// ------ Inline component: FieldError (un solo string) ------
const FieldError = defineComponent({
    name: 'FieldError',
    props: { message: { type: String, default: '' } },
    setup(p) {
        return () => (p.message
            ? h('p', { class: 'text-sm text-red-600 mt-1' }, p.message)
            : null)
    }
})

// ------ Form logic ------
const normalizeIn = (val: FormModel = {} as FormModel) => ({
    id: val.id ?? undefined,
    name: val.name ?? '',
    last_name: (val as any).last_name ?? (val as any).lastname ?? '',
    email: val.email ?? '',
    birth_day: (val.birth_day as string | null | undefined) ?? null, // 'YYYY-MM-DD' | null
    password: val.password ?? '', // sólo creación
    isActive: (val as any).isActive ?? true,
    avatar: (val as any).avatar ?? (val as any).image ?? '',
    facility_id: (val as any).facility_id ?? null,
    city_id: (val as any).city_id ?? null,
    rol_id: (val as any).rol_id ?? null,
})

const form = reactive(normalizeIn(props.modelValue))
const confirmPassword = ref('')

// Sync con padre
watch(() => props.modelValue, (nv) => Object.assign(form, normalizeIn(nv)))

// Errores UI (aplanados)
const fieldError = (field: string): string | undefined => props.errors?.[field]
const hasError = (field: string) => Boolean(fieldError(field))
const inputClass = (field: string) => [
    'w-full px-4 py-2 border rounded-lg shadow-sm',
    hasError(field) ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
].join(' ')

// Submit
const handleSubmit = () => {
    if (!form.id) {
        if ((form.password ?? '') !== confirmPassword.value) {
            Swal.fire({ icon: 'error', title: 'Contraseña no coincide', text: 'La confirmación de la contraseña no es correcta.' })
            return
        }
        if (!form.password || (form.password ?? '').length < 6) {
            Swal.fire({ icon: 'error', title: 'Contraseña inválida', text: 'La contraseña debe tener al menos 6 caracteres.' })
            return
        }
    }

    const payload: FormModel = {
        id: form.id,
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
    })
    if (result.isConfirmed) emit('cancel')
}

// Imagen → DataURL
const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement | null
    const file = input?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => { form.avatar = (e.target?.result as string) || '' }
    reader.readAsDataURL(file)
}

const { globalError } = props
</script>

<style scoped></style>
