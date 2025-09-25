// src/composables/useFormErrors.ts
import { ref, computed } from 'vue'
import { buildFieldErrorsRaw, toFlatErrors, globalErrorOf, type FieldErrorsRaw, type FlatErrors } from '@/utils/formErrors'

export function useFormErrors() {
    const raw = ref<FieldErrorsRaw>({})
    const flat = computed<FlatErrors>(() => toFlatErrors(raw.value))
    const global = computed<string | null>(() => globalErrorOf(raw.value))

    function setFromApiError(e: unknown) {
        raw.value = buildFieldErrorsRaw(e)
    }

    function clear() {
        raw.value = {}
    }

    return {
        // estado
        errorsRaw: raw,
        errors: flat,
        globalError: global,
        // acciones
        setFromApiError,
        clear,
    }
}
