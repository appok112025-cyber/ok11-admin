import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)

    const query = getQuery(event)
    const response = await backendApiRequest<any>(event, '/api/matches', {
      method: 'GET',
      query,
    })

    // Support both Strapi-style { data: [...] } and direct array responses
    const matchesData = response?.data || (Array.isArray(response) ? response : [])
    const pagination = response?.pagination || response?.meta?.pagination

    return {
      data: matchesData,
      meta: {
        pagination: pagination
          ? {
              page: pagination.page || 1,
              pageSize: pagination.limit || pagination.pageSize || 100,
              pageCount: pagination.totalPages || pagination.pageCount || 1,
              total: pagination.total || matchesData.length,
            }
          : undefined,
      },
    }
  } catch (error: any) {
    return handleApiError(error, 'fetch matches')
  }
})
