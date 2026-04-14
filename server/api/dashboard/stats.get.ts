import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

interface DashboardStats {
  totalUsers: number
  totalMatches: number
  activeMatches: number
  totalSubmissions: number
}

export default defineEventHandler(
  async (event): Promise<ApiResponse<DashboardStats>> => {
    try {
      requireAuth(event)

      const response = await backendApiRequest<any>(
        event,
        '/api/dashboard/stats',
        {
          method: 'GET',
        }
      )

      // Handle different response structures from backend
      const statsData: DashboardStats = response.data || response

      return {
        data: statsData,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch dashboard stats')
    }
  }
)
