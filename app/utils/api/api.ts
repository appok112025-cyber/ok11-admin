import type { ApiResponse, ApiError } from '~/types/api'

export const getApiErrorMessage = (error: any): string => {
  if (error.statusMessage) {
    return error.statusMessage
  }
  if (error.data?.message) {
    return error.data.message
  }
  if (error.message) {
    return error.message
  }

  if (error.status === 400) {
    return 'Invalid request. Please check your input.'
  }
  if (error.status === 403) {
    return 'Access forbidden. Please contact support.'
  }
  if (error.status === 404) {
    return 'Resource not found.'
  }
  if (error.status === 422) {
    return 'Validation failed. Please check your input.'
  }
  if (error.status === 429) {
    return 'Too many requests. Please try again later.'
  }
  if (error.status === 502) {
    return 'Service error. Please try again later.'
  }
  if (error.status === 503) {
    return 'Service temporarily unavailable. Please try again later.'
  }
  if (error.status >= 500) {
    return 'Server error. Please try again later.'
  }

  return 'An unexpected error occurred. Please try again.'
}

export const useApi = () => {
  const authStore = useAuthStore()

  const handleApiError = (error: any) => {
    if (error.status === 401) {
      authStore.logout()
      return
    }
    throw error
  }

  const apiFetch = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      headers?: Record<string, string>
      body?: any
    } = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await $fetch<ApiResponse<T>>(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        },
      })
      return response
    } catch (error: any) {
      handleApiError(error)
      const enhancedError = new Error(getApiErrorMessage(error))
      ;(enhancedError as any).status = error.status
      ;(enhancedError as any).statusMessage = error.statusMessage
      ;(enhancedError as any).data = error.data
      throw enhancedError
    }
  }

  const getUsers = async (params?: {
    page?: number
    pageSize?: number
    filters?: any
    sort?: string[]
  }) => {
    const queryParams = new URLSearchParams()

    if (params?.page)
      queryParams.append('pagination[page]', params.page.toString())
    if (params?.pageSize)
      queryParams.append('pagination[pageSize]', params.pageSize.toString())
    if (params?.sort) queryParams.append('sort', params.sort.join(','))

    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams.append(`filters[${key}]`, value as string)
      })
    }

    const query = queryParams.toString()
    const endpoint = `/users${query ? `?${query}` : ''}`

    return apiFetch(endpoint)
  }

  const getUserById = async (id: string | number) => {
    return apiFetch(`/users/${id}`)
  }

  const updateUser = async (id: string | number, data: any) => {
    return apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteUser = async (id: string | number) => {
    return apiFetch(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  const getCurrentUser = async () => {
    return apiFetch('/users/me')
  }

  const getSiteContent = async () => {
    return apiFetch('/site-content')
  }

  const updateSiteContent = async (data: any) => {
    return apiFetch('/site-content', {
      method: 'PUT',
      body: { data },
    })
  }

  const getFaqs = async () => {
    return apiFetch('/faqs?sort=order:asc')
  }

  const getFaqById = async (documentId: string) => {
    return apiFetch(`/faqs/${documentId}`)
  }

  const createFaq = async (data: any) => {
    return apiFetch('/faqs', {
      method: 'POST',
      body: { data },
    })
  }

  const updateFaq = async (documentId: string, data: any) => {
    return apiFetch(`/faqs/${documentId}`, {
      method: 'PUT',
      body: { data },
    })
  }

  const deleteFaq = async (documentId: string) => {
    return apiFetch(`/faqs/${documentId}`, {
      method: 'DELETE',
    })
  }

  const getTeams = async () => {
    return apiFetch('/teams')
  }

  const getTeamById = async (id: string | number) => {
    return apiFetch(`/teams/${id}`)
  }

  const createTeam = async (data: any) => {
    return apiFetch('/teams', {
      method: 'POST',
      body: data,
    })
  }

  const updateTeam = async (id: string | number, data: any) => {
    return apiFetch(`/teams/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteTeam = async (id: string | number) => {
    return apiFetch(`/teams/${id}`, {
      method: 'DELETE',
    })
  }

  const getMatches = async (params?: {
    page?: number
    limit?: number
    status?: string
  }) => {
    const queryParams = new URLSearchParams()

    // For admin panel, fetch all matches by default (high limit)
    // If specific pagination is needed, it can be passed
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    } else {
      // Default to fetching all matches (1000 should be enough for admin)
      queryParams.append('limit', '1000')
    }
    if (params?.status) {
      queryParams.append('status', params.status)
    }

    const query = queryParams.toString()
    return apiFetch(`/matches${query ? `?${query}` : ''}`)
  }

  const getMatchById = async (id: string | number) => {
    return apiFetch(`/matches/${id}`)
  }

  const createMatch = async (data: any) => {
    return apiFetch('/matches', {
      method: 'POST',
      body: { data },
    })
  }

  const updateMatch = async (id: string | number, data: any) => {
    return apiFetch(`/matches/${id}`, {
      method: 'PUT',
      body: { data },
    })
  }

  const deleteMatch = async (id: string | number) => {
    return apiFetch(`/matches/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    apiFetch,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getCurrentUser,
    getSiteContent,
    updateSiteContent,
    getFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    getMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch,
  }
}
