<template>
    <div class="form-container">
        <h2 class="text-2xl font-bold mb-4">{{ isEdit ? 'Editar Usuario' : 'Registrar Usuario' }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label class="label">Nombre</label>
                <input v-model="form.name" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Apellido</label>
                <input v-model="form.lastname" type="text" class="input" required />
            </div>

            <div>
                <label class="label">Email</label>
                <input v-model="form.email" type="email" class="input" required />
            </div>

            <div>
                <label class="label">WhatsApp</label>
                <input v-model="form.whatsapp" type="tel" placeholder="Ej: 5493743123456" class="input" required />
            </div>

            <div>
                <label class="label">Contraseña</label>
                <input v-model="form.password" type="password" class="input" required />
            </div>

            <button type="submit" class="btn-primary">
                {{ isEdit ? 'Actualizar Usuario' : 'Registrar Usuario' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
    user: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit'])

const form = reactive({
    name: props.user.name || '',
    lastname: props.user.lastname || '',
    email: props.user.email || '',
    whatsapp: props.user.whatsapp || '',
    password: ''
})

const isEdit = !!props.user?.id

function handleSubmit() {
    emit('submit', { ...form })
}
</script>
