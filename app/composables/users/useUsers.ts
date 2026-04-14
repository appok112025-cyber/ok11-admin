import type { UserWithMatches } from '~/types/user'
import { retry } from '~/utils/common/retry'
import { getApiErrorMessage } from '~/utils/api/api'

export const useUsers = () => {
  const route = useRoute()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const { getUsers, getUserById, updateUser, deleteUser } = useApi()
  const { createAbortController } = useRequestCancellation()

  const users = ref<UserWithMatches[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedUser = ref<UserWithMatches | null>(null)
  const showBlockDialog = ref(false)
  const blocking = ref(false)
  const showDeleteDialog = ref(false)
  const deleting = ref(false)
  const loadingUser = ref(false)

  const navigateToUser = async (userId: string | number | undefined) => {
    if (!userId) return
    const id = String(userId)
    const targetPath = `/users/${id}`

    // Don't navigate if already on the target path
    if (route.path === targetPath) {
      return
    }

    try {
      await navigateTo(targetPath)
    } catch (error: any) {
      // Ignore navigation cancelled or redundant navigation errors
      if (
        error?.name !== 'NavigationDuplicated' &&
        error?.name !== 'NavigationCancelled' &&
        !error?.message?.includes('redundant navigation')
      ) {
        console.error('Navigation error:', error)
      }
    }
  }

  const closeUserModal = async () => {
    const currentPath = route.path
    if (currentPath === '/users' || currentPath.startsWith('/users/')) {
      try {
        await navigateTo('/users')
      } catch (error: any) {
        // Ignore navigation cancelled or redundant navigation errors
        if (
          error?.name !== 'NavigationDuplicated' &&
          error?.name !== 'NavigationCancelled' &&
          !error?.message?.includes('redundant navigation')
        ) {
          console.error('Navigation error:', error)
        }
      }
    }
  }

  const openUserModal = async (userId: string) => {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      selectedUser.value = { ...user }
      return
    }

    loadingUser.value = true
    try {
      const response = await retry(() => getUserById(userId), {
        maxRetries: 2,
      })

      let userData: UserWithMatches | null = null

      // The server endpoint returns UserWithMatches directly or wrapped in ApiResponse
      if (response?.data && typeof response.data === 'object') {
        // Check if it's wrapped in ApiResponse
        if ('id' in response.data || 'email' in response.data) {
          userData = response.data as unknown as UserWithMatches
        }
      } else if (response && typeof response === 'object') {
        // Direct response (not wrapped)
        if ('id' in response || 'email' in response) {
          userData = response as unknown as UserWithMatches
        }
      }

      if (userData) {
        selectedUser.value = userData
      } else {
        showError('User not found')
        selectedUser.value = null
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
      selectedUser.value = null
    } finally {
      loadingUser.value = false
    }
  }

  const handleBlockUser = () => {
    showBlockDialog.value = true
  }

  const confirmBlockUser = async () => {
    if (!selectedUser.value) return

    blocking.value = true
    const userId = selectedUser.value.id
    const userIndex = users.value.findIndex(u => u.id === userId)
    const user = users.value[userIndex]

    if (userIndex === -1 || !user) {
      showError('User not found')
      blocking.value = false
      showBlockDialog.value = false
      return
    }

    // Optimistic update
    const previousBlockedStatus = user.blocked
    const newBlockedStatus = !previousBlockedStatus
    user.blocked = newBlockedStatus
    if (selectedUser.value) {
      selectedUser.value.blocked = newBlockedStatus
    }

    try {
      const updateResponse = await retry(
        () =>
          updateUser(userId, {
            blocked: newBlockedStatus,
          }),
        { maxRetries: 2 }
      )

      // Update API returns UserResponse directly (not wrapped in ApiResponse)
      // Response is valid if we got here without error

      success(
        `${selectedUser.value.name || selectedUser.value.email || 'User'} has been ${
          newBlockedStatus ? 'blocked' : 'unblocked'
        }`
      )
      showBlockDialog.value = false
    } catch (err: any) {
      // Rollback optimistic update
      user.blocked = previousBlockedStatus
      if (selectedUser.value) {
        selectedUser.value.blocked = previousBlockedStatus
      }

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
      // Close dialog even on error so user can try again
      showBlockDialog.value = false
    } finally {
      blocking.value = false
    }
  }

  const handleDeleteUser = () => {
    showDeleteDialog.value = true
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser.value) return

    deleting.value = true
    const userId = selectedUser.value.id
    const userName =
      selectedUser.value.name || selectedUser.value.email || 'User'
    const userIndex = users.value.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      showError('User not found')
      deleting.value = false
      showDeleteDialog.value = false
      return
    }

    // Optimistic update - remove from list
    const deletedUser = users.value[userIndex]
    if (!deletedUser) {
      showError('User not found')
      deleting.value = false
      showDeleteDialog.value = false
      return
    }

    users.value.splice(userIndex, 1)

    try {
      const deleteResponse = await retry(() => deleteUser(userId), {
        maxRetries: 2,
      })

      // Validate response (delete might return empty data, which is OK)
      // Just check that request didn't fail

      success(`${userName} has been deleted`)
      closeUserModal()
      showDeleteDialog.value = false
    } catch (err: any) {
      // Rollback optimistic update
      users.value.splice(userIndex, 0, deletedUser)

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
    } finally {
      deleting.value = false
    }
  }

  const loadUsers = async () => {
    loading.value = true
    error.value = null
    const abortController = createAbortController()

    try {
      const response = await retry(() => getUsers(), {
        maxRetries: 2,
        retryCondition: (err: any) => {
          // Don't retry if request was cancelled
          if (abortController.signal.aborted) return false
          // Retry on network errors or 5xx errors
          return !err.status || (err.status >= 500 && err.status < 600)
        },
      })

      // Check if request was cancelled
      if (abortController.signal.aborted) return

      // Handle edge cases: null, undefined, or empty data
      if (response?.data) {
        // Ensure data is an array
        if (Array.isArray(response.data)) {
          users.value = response.data as UserWithMatches[]
        } else {
          // If data is not an array, initialize as empty array
          users.value = []
          console.warn('API returned non-array data for users')
        }
      } else {
        // No data returned - initialize as empty array
        users.value = []
      }
    } catch (err: any) {
      // Don't show error if request was cancelled
      if (abortController.signal.aborted) return

      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
    } finally {
      if (!abortController.signal.aborted) {
        loading.value = false
      }
    }
  }

  return {
    users,
    loading,
    error,
    selectedUser,
    loadingUser,
    showBlockDialog,
    blocking,
    showDeleteDialog,
    deleting,
    navigateToUser,
    closeUserModal,
    openUserModal,
    handleBlockUser,
    confirmBlockUser,
    handleDeleteUser,
    confirmDeleteUser,
    loadUsers,
  }
}
