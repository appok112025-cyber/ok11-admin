import type { SiteContentResponse } from '@/types/site-content'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<SiteContentResponse> => {
    try {
      requireAuth(event)

      const response = await backendApiRequest<any>(
        event,
        '/api/site-content',
        {
          method: 'GET',
        }
      )

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch site content')
    }
  }
)
