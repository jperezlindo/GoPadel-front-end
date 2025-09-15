<!-- src/views/registrations/RegistrationPlayer.vue -->
<template>
    <div class="max-w-2xl mx-auto p-2 sm:p-4">
    
        <!-- Header -->
        <div class="mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Inscripción al Torneo</h1>
            <p v-if="tournament?.name" class="text-gray-600">
                {{ tournament.name }} — {{ tournament.facility }}
            </p>
        </div>

        <!-- Estado de carga / error inicial -->
        <div v-if="pageLoading" class="rounded-xl border bg-gray-50 p-4 text-gray-600">
            Cargando datos del torneo…
        </div>
        <div v-else-if="pageError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ pageError }}
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4 bg-white p-4 sm:p-6 rounded-2xl shadow-md">
            <!-- Categoría -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select v-model.number="form.tournamentCategoryId"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Seleccione una categoría…</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id" :disabled="!c.is_active">
                        {{ c.name }} — ${{ c.price }}
                        <span v-if="!c.is_active"> (inactiva)</span>
                    </option>
                </select>
                <p v-if="errors.tournamentCategoryId" class="text-sm text-red-600 mt-1">
                    {{ errors.tournamentCategoryId }}
                </p>
            </div>

            <!-- Partner -->
            <div>
                <PartnerSelect v-model="form.partnerId" placeholder="Buscar partner por nick, nombre o email…" />
                <p v-if="errors.partnerId" class="text-sm text-red-600 mt-1">
                    {{ errors.partnerId }}
                </p>
            </div>

            <!-- Referencia de pago (opcional) -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Referencia de pago (opcional)</label>
                <input v-model="form.paymentReference" type="text"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: MP-OP-12345" />
            </div>

            <!-- Comentario (opcional) -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Comentario (opcional)</label>
                <textarea v-model="form.comment" rows="3"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Preferimos jugar sábado por la tarde…" />
            </div>

            <!-- Acciones -->
            <div class="flex gap-2">
                <button type="button" @click="goBack"
                    class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full">
                    Cancelar
                </button>
                <button type="submit" :disabled="submitDisabled"
                    class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                    {{ submitLabel }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
/**
 * Registro de jugador a torneo:
 * - Carga torneo (incluye categorías mapeadas).
 * - Selección de categoría, partner y comentario.
 * - paid_amount = price de la categoría elegida.
 * - Orden canónico player/partner lo aplica el store.
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import PartnerSelect from '@/components/PartnerSelect.vue'
import { handleApi, normalizeApiError } from '@/utils/handleApi'
import { showToast } from '@/utils/alerts'
import { useRegistrationStore } from '@/stores/useRegistrationStore'

// ------- Router / Store -------
const route = useRoute()
const router = useRouter()
const regStore = useRegistrationStore()

// ------- State de página -------
const pageLoading = ref(true)
const pageError = ref(null)
const tournament = ref(null)

// ------- Form (v-model) -------
const form = ref({
    tournamentId: null,
    tournamentCategoryId: null,
    partnerId: null,
    paymentReference: '',
    comment: ''
})

const errors = ref({
    tournamentCategoryId: '',
    partnerId: ''
})

const submitDisabled = computed(() => {
    return regStore.isLoading || !form.value.tournamentCategoryId || !form.value.partnerId
})

const submitLabel = computed(() => (regStore.isLoading ? 'Registrando…' : 'Confirmar inscripción'))

// ------- Categorías disponibles (desde el torneo) -------
const categories = computed(() => Array.isArray(tournament.value?.categories) ? tournament.value.categories : [])

// ------- Helpers -------
const validate = () => {
    errors.value = { tournamentCategoryId: '', partnerId: '' }
    if (!form.value.tournamentCategoryId) errors.value.tournamentCategoryId = 'Seleccioná una categoría'
    if (!form.value.partnerId) errors.value.partnerId = 'Seleccioná un partner'
    return !errors.value.tournamentCategoryId && !errors.value.partnerId
}

const goBack = () => {
    router.back()
}

// Mapper local torneo API -> Front (podés reemplazar por tu mapper global si ya existe)
const fromApiLocal = (apiItem = {}) => ({
    id: apiItem.id ?? 0,
    name: apiItem.name ?? '',
    date_start: apiItem.date_start ?? '',
    date_end: apiItem.date_end ?? '',
    facility_id: apiItem.facility_id ?? 0,
    facility: apiItem.venue ?? apiItem.venue_name ?? apiItem.facility_name ?? '',
    isActive: Boolean(apiItem.is_active ?? apiItem.isActive ?? true),
    categories: Array.isArray(apiItem.categories) ? apiItem.categories.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        is_active: Boolean(c.is_active ?? true),
        category_id: c.category_id ?? c.category ?? null,
    })) : [],
})

// Cargar torneo por :id
const loadTournament = async () => {
    pageLoading.value = true
    pageError.value = null
    const id = Number(route.params.id)
    form.value.tournamentId = id

    try {
        // GET /api/v1/tournaments/:id/
        const res = await handleApi.get(`/api/v1/tournaments/${id}/`)
        const data = res?.data ?? res
        tournament.value = fromApiLocal(data)
    } catch (e) {
        const n = normalizeApiError(e)
        pageError.value = n.message || 'No se pudo cargar el torneo.'
    } finally {
        pageLoading.value = false
    }
}

onMounted(async () => {
    await loadTournament()
})

// ------- Submit -------
const handleSubmit = async () => {
    if (!validate()) return

    const selectedCat = categories.value.find(c => c.id === Number(form.value.tournamentCategoryId))
    if (!selectedCat) {
        showToast({ type: 'error', message: 'Categoría inválida' })
        return
    }

    const confirm = await Swal.fire({
        title: '¿Confirmar inscripción?',
        text: `Se registrará la pareja en "${selectedCat.name}" por $${selectedCat.price}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar'
    })
    if (!confirm.isConfirmed) return

    try {
        await regStore.createForPlayer({
            tournamentId: form.value.tournamentId,
            tournamentCategoryId: form.value.tournamentCategoryId,
            partnerId: form.value.partnerId,
            categoryPrice: selectedCat.price, // paid_amount = price
            paymentReference: form.value.paymentReference || undefined,
            comment: form.value.comment || undefined,
        })

        showToast({ type: 'success', message: 'Inscripción realizada con éxito' })
        // Podés redirigir a detalle del torneo o atrás:
        router.back()
    } catch (e) {
        // e ya viene normalizado por handleApi/Store
        showToast({ type: 'error', message: e?.message || 'Error al registrar' })
    }
}
</script>
