// src/utils/dateUtils.js

/** Zona horaria objetivo fija para que el resultado sea consistente */
const TARGET_TZ = 'America/Argentina/Cordoba'

/** Locale por defecto para textos en español */
const DEFAULT_LOCALE = 'es-AR'

/** Regex YYYY-MM-DD */
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Zero pad */
const z2 = (n) => String(n).padStart(2, '0')

/** Meses en español (número 1-12) */
const MONTH_NAMES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]

/**
 * Convierte a Date si hay hora/offset (ISO), o null si es inválido.
 * Para strings "YYYY-MM-DD" devolvemos null (los trataremos sin Date).
 * @param {string|Date|number} value
 * @returns {Date|null}
 */
export const toDate = (value) => {
  if (value == null) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string') {
    if (DATE_ONLY_RE.test(value)) return null // lo manejamos como fecha pura
    const d = new Date(value) // ISO con hora/offset -> absoluto
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/** Valida fecha u ISO con hora/offset, o fecha pura YYYY-MM-DD */
export const isValidDate = (value) => {
  if (typeof value === 'string' && DATE_ONLY_RE.test(value)) return true
  return toDate(value) !== null
}

/**
 * Extrae partes en una zona horaria fija usando Intl.
 * @param {Date} date
 * @param {string} locale
 * @returns {{year:number, month:number, day:number, hours:number, minutes:number, seconds:number}}
 */
const partsInTZ = (date, locale = DEFAULT_LOCALE) => {
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone: TARGET_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
  const p = fmt.formatToParts(date)
  const obj = {}
  for (const { type, value } of p) obj[type] = value
  return {
    year: Number(obj.year),
    month: Number(obj.month),
    day: Number(obj.day),
    hours: Number(obj.hour ?? 0),
    minutes: Number(obj.minute ?? 0),
    seconds: Number(obj.second ?? 0),
  }
}

/** --------- FORMATOS --------- */

/**
 * Formato largo en español: "4 de septiembre de 2025"
 * Acepta "YYYY-MM-DD" (sin Date) o ISO con hora/offset (usando TARGET_TZ).
 */
export const formatDateLongEs = (value, { locale = DEFAULT_LOCALE } = {}) => {
  if (value == null || value === '') return 'No definida'

  // Caso fecha pura
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY_RE)
    if (m) {
      const [, y, mo, d] = m
      return `${Number(d)} de ${MONTH_NAMES[Number(mo) - 1]} de ${Number(y)}`
    }
  }

  // Caso ISO con hora/offset -> formatear en TZ objetivo
  const d = toDate(value)
  if (!d) return 'No definida'
  const { year, month, day } = partsInTZ(d, locale)
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`
}

/** DD/MM/YYYY */
export const formatDateShortEs = (value, { locale = DEFAULT_LOCALE } = {}) => {
  if (value == null || value === '') return 'No definida'

  // Fecha pura
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY_RE)
    if (m) {
      const [, y, mo, d] = m
      return `${d}/${mo}/${y}`
    }
  }

  const d = toDate(value)
  if (!d) return 'No definida'
  const { year, month, day } = partsInTZ(d, locale)
  return `${z2(day)}/${z2(month)}/${year}`
}

/** YYYY-MM-DD */
export const formatDateISO = (value, { empty = '' , locale = DEFAULT_LOCALE } = {}) => {
  if (value == null || value === '') return empty

  // Fecha pura
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY_RE)
    if (m) return value
  }

  const d = toDate(value)
  if (!d) return empty
  const { year, month, day } = partsInTZ(d, locale)
  return `${year}-${z2(month)}-${z2(day)}`
}

/** HH:mm en TZ objetivo */
export const formatTime = (value, { empty = '', locale = DEFAULT_LOCALE } = {}) => {
  if (value == null || value === '') return empty

  // Para fecha pura, no hay hora -> devolver vacío o "00:00" según prefieras
  if (typeof value === 'string' && DATE_ONLY_RE.test(value)) return empty

  const d = toDate(value)
  if (!d) return empty
  const { hours, minutes } = partsInTZ(d, locale)
  return `${z2(hours)}:${z2(minutes)}`
}

/** DD/MM/YYYY HH:mm */
export const formatDateTimeShortEs = (value, { empty = '', locale = DEFAULT_LOCALE } = {}) => {
  if (value == null || value === '') return empty

  // Fecha pura -> solo la fecha
  if (typeof value === 'string' && DATE_ONLY_RE.test(value)) {
    return formatDateShortEs(value, { locale })
  }

  const d = toDate(value)
  if (!d) return empty
  return `${formatDateShortEs(d, { locale })} ${formatTime(d, { locale })}`
}

/**
 * ISO completo en UTC ('Z').
 * Si el original era fecha pura YYYY-MM-DD, devolvemos 'YYYY-MM-DDT00:00:00.000Z'
 * (ajustalo si querés preservar offset real).
 */
export const toFullISO = (value, { locale = DEFAULT_LOCALE } = {}) => {
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY_RE)
    if (m) {
      const [, y, mo, d] = m
      // Sin librerías es complejo construir "esa medianoche" en TARGET_TZ y pasar a UTC.
      // Elegimos convención simple: medianoche UTC del mismo día.
      return `${y}-${mo}-${d}T00:00:00.000Z`
    }
  }
  const d = toDate(value)
  if (!d) return ''
  return d.toISOString()
}

export const toISOStartOfDayInTargetTZ = (value, offset = '-03:00') => {
  const ymd = formatDateISO(value) // ya preserva el "día" correcto
  return ymd ? `${ymd}T00:00:00${offset}` : ''
}

/** Alias práctico: preserva el día de TZ objetivo en YYYY-MM-DD */
export const toISODatePreservingLocal = (value) => formatDateISO(value)
