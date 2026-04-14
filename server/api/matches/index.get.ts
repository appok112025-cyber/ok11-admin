import type { ApiResponse } from '@/types/api'
import type { Match } from '@/types/match'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Match[]>> => {
    try {
      requireAuth(event)

      const query = getQuery(event)
      const response = await backendApiRequest<any>(event, '/api/matches', {
        method: 'GET',
        query,
      })

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch matches')
    }
  }
)
