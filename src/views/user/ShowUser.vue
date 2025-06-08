<template>
    <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <h2 class="text-2xl font-bold mb-4">Detalles del Usuario { agregar rol }</h2>

        <div class="flex items-center space-x-4 mb-6">
            <img v-if="user?.avatar" :src="user.avatar" alt="Foto de perfil"
                class="w-24 h-24 rounded-full object-cover border" />
            <div>
                <p><span class="font-semibold">Nombre: </span> {{ user?.name }} {{ user?.lastname }}</p>
                <p><span class="font-semibold">Email: </span> {{ user?.email }}</p>
                <p><span class="font-semibold">WhatsApp: </span> {{ user?.whatsapp || 'No informado' }}</p>
                <p><span class="font-semibold">Estado: </span>
                    <span :class="user?.isActive ? 'text-green-600' : 'text-red-600'">
                        {{ user?.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    user: {
        type: Object,
        default: () => ({ name: '', lastname: '', email: '', whatsapp: '', isactive: false, image: '' })
    },
    editable: {
        type: Boolean,
        default: false
    },
    isEditMode: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['detailsConfirm', 'cancel'])

const handleConfirm = () => {
    emit('detailsConfirm')
}

const handleCancel = () => {
    emit('cancel')
}
</script>

<style scoped></style>
