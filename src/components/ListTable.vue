<!-- ListTable.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-md p-0 overflow-x-auto" aria-label="Tabla de datos">
    <table class="min-w-full w-full text-left border-collapse">
      <thead>
        <tr>
          <th
            v-for="(col, index) in columns"
            :key="index"
            class="px-4 py-2 text-gray-600 text-sm uppercase tracking-wide border-b"
            scope="col"
          >
            {{ col.label }}
          </th>

          <!-- Solo muestro el header de acciones si hay slot -->
          <th
            v-if="hasActions"
            class="px-4 py-2 text-gray-600 text-sm uppercase border-b"
            scope="col"
          >
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowKey ? (row as any)[rowKey] : rowIndex"
          class="hover:bg-gray-50 transition border-b"
        >
          <td
            v-for="(col, colIndex) in columns"
            :key="colIndex"
            class="px-4 py-3 text-sm text-gray-800"
          >
            <!-- Soporte de render por columna; de lo contrario imprime el campo -->
            <component
              v-if="col.render"
              :is="col.render!(row)"
            />
            <template v-else>
              {{ (row as any)[col.field] }}
            </template>
          </td>

          <td v-if="hasActions" class="px-4 py-3">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!data || !data.length" class="text-gray-500 text-sm mt-4 px-4 py-2">
      No hay registros disponibles.
    </p>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * Columnas tipadas:
 *  - field: clave del objeto T
 *  - render?: función para renderizar la celda (opcional). Devuelve VNode/JSX/resultado de h().
 */
export type Column<T> = {
  label: string
  field: keyof T & string
  render?: (row: T) => any
}

const props = defineProps<{
  columns: ReadonlyArray<Column<T>>
  data: ReadonlyArray<T>
  /** clave opcional para el :key de cada fila (mejor que el índice) */
  rowKey?: keyof T & string
}>()

/** Tipado del slot 'actions' para que { row } sea T */
const slots = defineSlots<{
  actions?: (arg: { row: T }) => any
}>()

const hasActions = !!slots.actions
const { columns, data, rowKey } = props
</script>
