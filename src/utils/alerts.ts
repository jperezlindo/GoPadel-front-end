// src/utils/alerts.ts
import Swal, { SweetAlertIcon } from 'sweetalert2'

export type ToastType = Extract<
  SweetAlertIcon,
  'success' | 'error' | 'warning' | 'info' | 'question'
>

export interface ShowToastOptions {
  type?: ToastType
  message?: string
  duration?: number
}

/** Toast simple (drop-in con la misma firma que tenías) */
export const showToast = ({
  type = 'success',
  message = 'Operación exitosa',
  duration = 3000,
}: ShowToastOptions = {}) => {
  void Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
  })
}

export const showError = (message = 'Ocurrió un error inesperado') => {
  void Swal.fire('Error', message, 'error')
}

export const showSuccess = (message = 'Operación realizada con éxito') => {
  void Swal.fire('Éxito', message, 'success')
}
