import type { ApiResponse } from '@/types/api'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')
    const body = await readBody(event)

    const response = await backendApiRequest<any>(
      event,
      `/api/notifications/${id}`,
      {
        method: 'PUT',
        body: body.data || body,
      }
    )

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'update notification')
  }
})
