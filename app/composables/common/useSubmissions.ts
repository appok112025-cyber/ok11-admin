import type { Submission, SubmissionFilters } from '~/types/submission'
import { getApiErrorMessage } from '~/utils/api/api'
// useToast is auto-imported

export const useSubmissions = () => {
  const { success, error: showError } = useToast()
  const submissions = useState<Submission[]>('submissions', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadSubmissions = async (
    filters?: SubmissionFilters & { page?: number; limit?: number }
  ) => {
    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (filters?.userId) query.append('userId', filters.userId)
      if (filters?.matchId) query.append('matchId', filters.matchId)
      if (filters?.status) query.append('status', filters.status)
      if (filters?.page) query.append('page', filters.page.toString())
      if (filters?.limit) query.append('limit', filters.limit.toString())

      const queryString = query.toString()
      const url = `/api/submissions${queryString ? `?${queryString}` : ''}`

      const response = await $fetch<any>(url)

      // Handle different response structures
      // Backend might return: { data: [...], pagination: {...} } or { data: { data: [...], pagination: {...} } }
      let submissionsData: any[] = []
      let paginationMeta: any = null

      if (Array.isArray(response)) {
        // Response is directly an array
        submissionsData = response
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          // Response has data as array
          submissionsData = response.data
          paginationMeta = response.pagination || response.meta?.pagination
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Nested data structure
          submissionsData = response.data.data
          paginationMeta =
            response.data.pagination ||
            response.data.meta?.pagination ||
            response.pagination
        }
      }

      // Transform API response to match Submission interface
      // Backend returns userId as populated object with email and displayName
      const transformedData = submissionsData.map((item: any) => {
        const userId = item.userId
        const userEmail =
          typeof userId === 'object' && userId?.email ? userId.email : ''
        const userName =
          typeof userId === 'object' && userId?.displayName
            ? userId.displayName
            : typeof userId === 'string'
              ? userId
              : 'Unknown User'

        // Transform player arrays
        const teamASelectedPlayers = Array.isArray(item.teamASelectedPlayers)
          ? item.teamASelectedPlayers.map((p: any) => ({
              id: typeof p === 'object' ? p._id || p.id : p,
              name: typeof p === 'object' ? p.name || 'Unknown' : 'Unknown',
            }))
          : []

        const teamBSelectedPlayers = Array.isArray(item.teamBSelectedPlayers)
          ? item.teamBSelectedPlayers.map((p: any) => ({
              id: typeof p === 'object' ? p._id || p.id : p,
              name: typeof p === 'object' ? p.name || 'Unknown' : 'Unknown',
            }))
          : []

        return {
          ...item,
          id: item._id || item.id,
          userId: typeof userId === 'object' ? userId._id || userId.id : userId,
          userName: userName,
          userEmail: userEmail,
          matchId:
            typeof item.matchId === 'object'
              ? item.matchId._id || item.matchId.id
              : item.matchId,
          selectedPlayer:
            typeof item.selectedPlayer === 'object'
              ? item.selectedPlayer.name || item.selectedPlayer._id
              : item.selectedPlayer,
          teamASelectedPlayers,
          teamBSelectedPlayers,
        } as Submission
      })

      submissions.value = transformedData
      return paginationMeta || response.meta?.pagination
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error loading submissions:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const getSubmission = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<any>(`/api/submissions/${id}`)

      // Unwrap the response if it's wrapped in { data: ... }
      const item = response?.data || response

      // Transform API response to match Submission interface
      const userId = item.userId
      const userEmail =
        typeof userId === 'object' && userId?.email ? userId.email : ''
      const userName =
        typeof userId === 'object' && userId?.displayName
          ? userId.displayName
          : typeof userId === 'string'
            ? userId
            : 'Unknown User'

      // Transform player arrays
      const teamASelectedPlayers = Array.isArray(item.teamASelectedPlayers)
        ? item.teamASelectedPlayers.map((p: any) => ({
            id: typeof p === 'object' ? p._id || p.id : p,
            name: typeof p === 'object' ? p.name || 'Unknown' : 'Unknown',
          }))
        : []

      const teamBSelectedPlayers = Array.isArray(item.teamBSelectedPlayers)
        ? item.teamBSelectedPlayers.map((p: any) => ({
            id: typeof p === 'object' ? p._id || p.id : p,
            name: typeof p === 'object' ? p.name || 'Unknown' : 'Unknown',
          }))
        : []

      // Extract match data with team names
      const matchData =
        item.matchId && typeof item.matchId === 'object'
          ? {
              id: item.matchId._id || item.matchId.id,
              matchNumber: item.matchId.matchNumber,
              status: item.matchId.status,
              teamA: item.matchId.teamA
                ? {
                    id: item.matchId.teamA._id || item.matchId.teamA.id || '',
                    name: item.matchId.teamA.name || '',
                    imageUrl: item.matchId.teamA.imageUrl || '',
                  }
                : undefined,
              teamB: item.matchId.teamB
                ? {
                    id: item.matchId.teamB._id || item.matchId.teamB.id || '',
                    name: item.matchId.teamB.name || '',
                    imageUrl: item.matchId.teamB.imageUrl || '',
                  }
                : undefined,
            }
          : undefined

      const data: Submission = {
        ...item,
        id: item._id || item.id,
        userId: typeof userId === 'object' ? userId._id || userId.id : userId,
        userName: userName,
        userEmail: userEmail,
        matchId:
          typeof item.matchId === 'object'
            ? item.matchId._id || item.matchId.id
            : item.matchId,
        match: matchData,
        selectedPlayer:
          typeof item.selectedPlayer === 'object'
            ? item.selectedPlayer.name || item.selectedPlayer._id
            : item.selectedPlayer,
        teamASelectedPlayers,
        teamBSelectedPlayers,
      }

      return data
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error loading submission:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createSubmission = async (
    submission: Omit<Submission, 'id' | 'submittedAt'>
  ) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Submission>('/api/submissions', {
        method: 'POST',
        body: submission,
      })
      submissions.value.push(data)
      success('Submission created successfully')
      return data
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error creating submission:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Submission>(`/api/submissions/${id}`, {
        method: 'PUT',
        body: updates,
      })

      const index = submissions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        submissions.value[index] = data
      }

      success('Submission updated successfully')
      return data
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error updating submission:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteSubmission = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      })

      submissions.value = submissions.value.filter(s => s.id !== id)
      success('Submission deleted successfully')
      return true
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
      console.error('Error deleting submission:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    submissions,
    loading,
    error,
    loadSubmissions,
    getSubmission,
    createSubmission,
    updateSubmission,
    deleteSubmission,
  }
}
