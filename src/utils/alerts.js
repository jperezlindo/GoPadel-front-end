// src/utils/alerts.js
import Swal from 'sweetalert2'

export const showToast = ({
  type = 'success',
  message = 'Operación exitosa',
  duration = 3000
} = {}) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true
  })
}

export const showError = (message = 'Ocurrió un error inesperado') => {
  Swal.fire('Error', message, 'error')
}

export const showSuccess = (message = 'Operación realizada con éxito') => {
  Swal.fire('Éxito', message, 'success')
}
