import type { ApiResponse } from '@/types/api'
import type { Faq } from '@/types/faq'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<Faq>> => {
  try {
    requireAuth(event)
    const body = await readBody(event)

    const response = await backendApiRequest<any>(event, '/api/faqs', {
      method: 'POST',
      body: body.data || body,
    })

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'create FAQ')
  }
})
