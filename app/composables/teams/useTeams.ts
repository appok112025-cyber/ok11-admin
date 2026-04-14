import { getApiErrorMessage } from '~/utils/api/api'

interface Team {
  id: string
  name: string
  imageUrl: string
}

interface TeamResponse {
  success: boolean
  data?: Team | Team[]
  message?: string
}

export const useTeams = () => {
  const { success, error: showError } = useToast()
  const teams = ref<Team[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTeams = async (search?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await $fetch<{ data: any[] }>(`/api/teams${query}`)
      teams.value = (response.data || []).map((team: any) => ({
        id: team._id || team.id,
        name: team.name,
        imageUrl: team.imageUrl || '',
      }))
      return { success: true, data: teams.value }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error fetching teams:', err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const createTeam = async (name: string, imageUrl: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/teams', {
        method: 'POST',
        body: { name, imageUrl },
      })
      success('Team created successfully')
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error creating team:', err)
    } finally {
      isLoading.value = false
      await fetchTeams()
    }
  }

  const updateTeam = async (id: string, name: string, imageUrl: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/teams/${id}`, {
        method: 'PUT',
        body: { name, imageUrl },
      })
      success('Team updated successfully')
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error updating team:', err)
    } finally {
      isLoading.value = false
      await fetchTeams()
    }
  }

  const deleteTeam = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      })
      success('Team deleted successfully')
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error deleting team:', err)
    } finally {
      isLoading.value = false
      await fetchTeams()
    }
  }

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  }
}
