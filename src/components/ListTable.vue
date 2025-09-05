<template>
    <div class="bg-white rounded-2xl shadow-md p-0 overflow-x-auto" aria-label="Tabla de datos">
        <table class="min-w-full w-full text-left border-collapse">
            <thead>
                <tr>
                    <th v-for="(col, index) in columns" :key="index"
                        class="px-4 py-2 text-gray-600 text-sm uppercase tracking-wide border-b"
                        scope="col">
                        {{ col.label }}
                    </th>
                    <th class="px-4 py-2 text-gray-600 text-sm uppercase border-b" scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in data" :key="rowIndex" class="hover:bg-gray-50 transition border-b">
                    <td v-for="(col, colIndex) in columns" :key="colIndex" class="px-4 py-3 text-sm text-gray-800">
                        {{ row[col.field] }}
                    </td>
                    <td class="px-4 py-3">
                        <slot name="actions" :row="row" />
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-if="!data.length" class="text-gray-500 text-sm mt-4">No hay registros disponibles.</p>
    </div>
</template>

<script setup>
defineProps({
    columns: {
        type: Array,
        required: true
    },
    data: {
        type: Array,
        required: true
    }
})
</script>