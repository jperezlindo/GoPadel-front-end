<template>
    <div class="flex items-center justify-center space-x-4 mb-6">
        <div v-for="(step, index) in steps" :key="index" class="flex items-center space-x-2">
            <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                currentStep === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
            ]">
                {{ index + 1 }}
            </div>
            <span class="hidden sm:inline text-sm font-medium" :class="{ 'text-blue-600': currentStep === index + 1 }">
                {{ step }}
            </span>

            <div v-if="index < steps.length - 1" class="w-8 h-px bg-gray-400 sm:w-12"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    steps: {
        type: Array,
        required: true
    },
    currentStep: {
        type: Number,
        required: true
    }
})
</script>

<style scoped></style>
