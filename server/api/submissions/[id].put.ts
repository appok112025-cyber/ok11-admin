import type { ApiResponse } from '@/types/api'
import type { Submission } from '@/types/submission'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Submission>> => {
    try {
      requireAuth(event)
      const id = requireParam(event, 'id')
      const body = await readBody(event)

      const endpoint = body.evaluate
        ? `/api/submissions/${id}/evaluate`
        : `/api/submissions/${id}`

      const response = await backendApiRequest<any>(event, endpoint, {
        method: 'PUT',
        body: body.evaluate ? undefined : body,
      })

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'update submission')
    }
  }
)
