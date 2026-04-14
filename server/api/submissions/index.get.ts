import type { ApiResponse } from '@/types/api'
import type { Submission } from '@/types/submission'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Submission[]>> => {
    try {
      requireAuth(event)

      const query = getQuery(event)
      const response = await backendApiRequest<any>(event, '/api/submissions', {
        method: 'GET',
        query,
      })

      const pagination = response.pagination || response.meta?.pagination

      return {
        data: response.data || [],
        meta: {
          pagination: pagination
            ? {
                page: pagination.page || 1,
                pageSize: pagination.limit || pagination.pageSize || 20,
                pageCount: pagination.totalPages || pagination.pageCount || 0,
                total: pagination.total || 0,
              }
            : undefined,
        },
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch submissions')
    }
  }
)
