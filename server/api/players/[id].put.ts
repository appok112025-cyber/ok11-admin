import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const response = await backendApiRequest<any>(event, `/api/players/${id}`, {
      method: 'PUT',
      body,
    })

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'update player')
  }
})
