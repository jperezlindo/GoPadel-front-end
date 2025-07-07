<template>
    <div class="max-w-2xl mx-auto p-2 sm:p-4">
        <h2 class="text-2xl font-bold mb-4">{{ form.id ? 'Editar Usuario' : 'Registrar Usuario' }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-4 sm:p-6 rounded-2xl shadow-md">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-1 font-medium">Nombre</label>
                    <input v-model="form.name" type="text" class="w-full px-4 py-2 border rounded-lg shadow-sm" required />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Apellido</label>
                    <input v-model="form.lastname" type="text" class="w-full px-4 py-2 border rounded-lg shadow-sm" required />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Email</label>
                    <input v-model="form.email" type="email" class="w-full px-4 py-2 border rounded-lg shadow-sm" required />
                </div>
                <div>
                    <label class="block mb-1 font-medium">WhatsApp</label>
                    <input v-model="form.whatsapp" type="tel" class="w-full px-4 py-2 border rounded-lg shadow-sm" required/>
                </div>

                <!-- Campos visibles solo en modo creación -->
                <template v-if="!form.id">
                    <div>
                        <label class="block mb-1 font-medium">Contraseña</label>
                        <input v-model="form.password" type="password" class="w-full px-4 py-2 border rounded-lg shadow-sm" required />
                    </div>
                    <div>
                        <label class="block mb-1 font-medium">Confirmar contraseña</label>
                        <input v-model="confirmPassword" type="password" class="w-full px-4 py-2 border rounded-lg shadow-sm" required />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block mb-1 font-medium">¿Activo?</label>
                        <select v-model="form.isActive" class="w-full px-4 py-2 border rounded-lg shadow-sm">
                            <option :value="true">Sí</option>
                            <option :value="false">No</option>
                        </select>
                    </div>
                </template>

                <!-- Imagen -->
                <div class="sm:col-span-2">
                    <label class="block mb-1 font-medium">Foto de perfil</label>
                    <input type="file" accept="image/*" @change="handleImageUpload" class="w-full px-4 py-2 border rounded-lg shadow-sm" />
                    <div v-if="form.image" class="mt-2 flex justify-center">
                        <img :src="form.image" alt="Previsualización"
                            class="w-24 h-24 rounded-full object-cover border" />
                    </div>
                </div>
            </div>

            <!-- Botones -->
            <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
                <button type="button" @click="handleCancel" class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
                    Cancelar
                </button>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    {{ form.id ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
    modelValue: Object
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ ...props.modelValue })
const confirmPassword = ref('')

watch(
    () => props.modelValue,
    (newVal) => {
        Object.assign(form, newVal)
    }
)

const handleSubmit = () => {
    if (!form.id && form.password !== confirmPassword.value) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña no coincide',
            text: 'La confirmación de la contraseña no es correcta.',
        })
        return
    }

    emit('submit', { ...form })
}

const handleCancel = async () => {
    const result = await Swal.fire({
        title: 'Cancelar operación',
        text: '¿Estás seguro de que querés cancelar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver'
    })

    if (result.isConfirmed) {
        emit('cancel')
    }
}

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            form.image = e.target.result
        }
        reader.readAsDataURL(file)
    }
}
</script>

<style scoped>

</style>