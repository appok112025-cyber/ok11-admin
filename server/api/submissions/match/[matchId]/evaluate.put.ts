import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../../../utils/api'
import { backendApiRequest } from '../../../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<{ message: string }>> => {
    try {
      requireAuth(event)

      const matchId = getRouterParam(event, 'matchId')

      if (!matchId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Match ID is required',
        })
      }

      const response = await backendApiRequest<{ message: string }>(
        event,
        `/api/submissions/match/${matchId}/evaluate`,
        {
          method: 'PUT',
        }
      )

      return {
        data: response.data || response,
      }
    } catch (error: any) {
      return handleApiError(error, 're-evaluate match submissions')
    }
  }
)
