<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg text-center">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ message }}</h2>
            <div class="flex justify-center space-x-4">
                <button @click="onConfirm" class="btn-primary px-4">Sí</button>
                <button @click="onCancel" class="btn-secondary px-4">No</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    message: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>

<style scoped>
.btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition;
}

.btn-secondary {
    @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition;
}
</style>
