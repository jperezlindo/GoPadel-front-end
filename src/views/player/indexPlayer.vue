<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Jugadores</h2>
            <button @click="goToCreate" class="btn-primary w-auto px-4">+ Nuevo Jugador</button>
        </div>

        <ListTable :columns="columns" :data="players">
            <template #actions="{ row }">
                <button @click="viewPlayer(row)" class="text-green-600 hover:underline mr-2">Ver</button>
                <button @click="editPlayer(row.id)" class="text-blue-600 hover:underline">Editar</button>
            </template>
        </ListTable>

        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
                <button @click="closeModal"
                    class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
                <ShowPlayer :user="user" :player="selectedPlayer" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ListTable from '@/components/ListTable.vue'
import ShowPlayer from '@/views/player/showPlayer.vue'

import { usePlayerStore } from '@/stores/usePlayerStore'
import { useUserStore } from '@/stores/useUserStore'
import { useCategoryStore }  from '@/stores/useCategoryStore'


const router = useRouter()
const playerStore = usePlayerStore()
const userStore = useUserStore()
const categoryStore = useCategoryStore()

const showModal = ref(false)
const selectedPlayer = ref(null)
const user = ref(null)
const players = ref([])
const categories = ref([])

const columns = [
    { label: 'Nickname', field: 'nickname' },
    { label: 'Posicion', field: 'position' },
    { label: 'Categoria', field: 'category_id' },
]

onMounted(()=>{
    players.value = playerStore.players
})

const goToCreate = () => {
    router.push({ name: 'CreatePlayer' })
}

const editPlayer = (id) => {
    router.push({ name: 'EditPlayer', params: { id } })
}

const viewPlayer = (player) => {
    selectedPlayer.value = player
    user.value = userStore.getUserById(Number(selectedPlayer.value.user_id))
    selectedPlayer.value.category = categoryStore.getCategoryById(Number(selectedPlayer.value.category_id)).name

    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedPlayer.value = null
}
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}
</style>
