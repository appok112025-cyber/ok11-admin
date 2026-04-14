import type { ApiResponse } from '@/types/api'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')

    await backendApiRequest(event, `/api/matches/${id}`, {
      method: 'DELETE',
    })

    return {
      data: { id },
      meta: {},
    }
  } catch (error: any) {
    return handleApiError(error, 'delete match')
  }
})
