import type { Toast } from '~/types/toast'

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const addToast = (
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      message,
      type,
      duration,
    }

    toasts.value.push(toast)

    const actualDuration =
      type === 'error' ? Math.max(duration, 3000) : duration

    setTimeout(() => {
      removeToast(id)
    }, actualDuration)
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast: Toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) =>
    addToast(message, 'success', duration)
  const error = (message: string, duration?: number) =>
    addToast(message, 'error', duration || 4000)
  const warning = (message: string, duration?: number) =>
    addToast(message, 'warning', duration)
  const info = (message: string, duration?: number) =>
    addToast(message, 'info', duration)

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
