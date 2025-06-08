<template>
    <div class="space-y-2">
        <h2 class="text-2xl font-bold mb-4">Detalles de la Categoría</h2>
        <p><span class="font-semibold">Nombre:</span> {{ category.name }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    category: {
        type: Object,
        required: true
    }
})
</script>
