import type { ApiResponse } from '@/types/api'
import type { Submission } from '@/types/submission'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Submission>> => {
    try {
      requireAuth(event)
      const id = requireParam(event, 'id')

      const response = await backendApiRequest<any>(
        event,
        `/api/submissions/${id}`,
        {
          method: 'GET',
        }
      )

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch submission')
    }
  }
)
