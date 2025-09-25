// src/utils/formErrors.ts
export type FieldErrorsRaw = Record<string, string | string[]> & { _error?: string | string[] }
export type FlatErrors = Record<string, string | undefined>

/** Toma { campo: string | string[] } y devuelve { campo: string } (primer msg) */
export function toFlatErrors(errs: FieldErrorsRaw | undefined | null): FlatErrors {
    const out: FlatErrors = {}
    if (!errs) return out
    for (const [k, v] of Object.entries(errs)) {
        if (k === '_error') continue
        out[k] = Array.isArray(v) ? v[0] : v
    }
    return out
}

/** Devuelve el primer mensaje global si existe */
export function globalErrorOf(errs: FieldErrorsRaw | undefined | null): string | null {
    if (!errs || errs._error == null) return null
    const g = errs._error
    return Array.isArray(g) ? g[0] : g
}

/** Fallback robusto: construye FieldErrorsRaw desde cualquier payload de error */
export function buildFieldErrorsRaw(e: unknown): FieldErrorsRaw {
    const out: FieldErrorsRaw = {}
    const data: any = (e as any)?.detail ?? (e as any)?.response?.data ?? (e as any)?.data ?? e

    if (!data) {
        out._error = 'Ocurrió un error inesperado. Intenta nuevamente.'
        return out
    }
    if (typeof data === 'string') {
        out._error = data
        return out
    }
    if (Array.isArray(data)) {
        out._error = data.join(', ')
        return out
    }

    // objeto: copiar claves; special-cases
    for (const key of Object.keys(data)) {
        const val = data[key]
        if (key === 'detail' || key === 'non_field_errors' || key === 'nonFieldErrors') {
            const arr = Array.isArray(val) ? val : [String(val)]
            out._error = arr.join(' ')
            continue
        }
        if (Array.isArray(val)) out[key] = val.map((v) => String(v))
        else if (typeof val === 'string') out[key] = val
        else out[key] = JSON.stringify(val)
    }
    return out
}
