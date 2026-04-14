import { getApiErrorMessage } from '~/utils/api/api'
// useToast is auto-imported

interface Notification {
  id: string
  title: string
  body: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

export const useNotifications = () => {
  const { success, error: showError } = useToast()
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotifications = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await $fetch<{ data: any[] }>('/api/notifications')
      notifications.value = (response.data || []).map((notif: any) => ({
        ...notif,
        id: notif._id || notif.id,
      }))
      return { success: true, data: notifications.value }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error fetching notifications:', err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const createNotification = async (data: {
    title: string
    body: string
    image?: string
  }) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/notifications', {
        method: 'POST',
        body: data,
      })
      success('Notification created successfully')
      await fetchNotifications()
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error creating notification:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateNotification = async (
    id: string,
    data: { title: string; body: string; image?: string }
  ) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        body: data,
      })
      success('Notification updated successfully')
      await fetchNotifications()
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error updating notification:', err)
    } finally {
      isLoading.value = false
    }
  }

  const deleteNotification = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      success('Notification deleted successfully')
      await fetchNotifications()
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error deleting notification:', err)
    } finally {
      isLoading.value = false
    }
  }

  const sendNotification = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/notifications/${id}/send`, {
        method: 'POST',
      })
      success('Notification sent successfully')
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error sending notification:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
  }
}
