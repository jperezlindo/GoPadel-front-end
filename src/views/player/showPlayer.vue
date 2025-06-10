<template>
    <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
        <h2 class="text-2xl font-bold mb-4">Detalles del Jugador </h2>

        <div class="flex items-center space-x-4 mb-6">
            <img v-if="user?.avatar" :src="user.avatar" alt="Foto de perfil"
                class="w-24 h-24 rounded-full object-cover border" />
            <div>
                <p><span class="font-semibold">Nombre: </span> {{ user?.name }} {{ user?.lastname }}</p>
                <p><span class="font-semibold">Email: </span> {{ user?.email }}</p>
                <p><span class="font-semibold">WhatsApp: </span> {{ user?.whatsapp }}</p>
                <p><span class="font-semibold">Nickname: </span> {{ player?.nickname }}</p>
                <p><span class="font-semibold">Posicion: </span> {{ player?.position }}</p>
                <p><span class="font-semibold">Categoria: </span> {{ player?.category }}</p>
                <p><span class="font-semibold">Level: </span> {{ player?.level || 'No Informado' }}</p>
                <p><span class="font-semibold">Puntos: </span> {{ player?.points || 'No Informado' }}</p>

                <p><span class="font-semibold">Estado: </span>
                    <span :class="player?.isActive ? 'text-green-600' : 'text-red-600'">
                        {{ player?.isActive ? 'Activo' : 'Inactivo' }}
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
        default: () => ({ 
            name: '', 
            lastname: '', 
            email: '', 
            whatsapp: '', 
            isActive: false,
        })
    },
    player: {
        type: Object,
        default: () => ({
            nickname: '',
            position: '',
            category: '',
            level: null,
            points: null,
            isActive: true,
        })
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
</script>

<style scoped></style>