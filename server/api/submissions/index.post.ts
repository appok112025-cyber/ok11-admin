import type { ApiResponse } from '@/types/api'
import type { Submission } from '@/types/submission'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Submission>> => {
    try {
      requireAuth(event)
      const body = await readBody(event)

      const response = await backendApiRequest<any>(event, '/api/submissions', {
        method: 'POST',
        body: body.data || body,
      })

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'create submission')
    }
  }
)
