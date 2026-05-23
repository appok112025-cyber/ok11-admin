import { defineEventHandler } from 'h3'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = event.context.params?.id
    
    if (!id || id === 'undefined') {
      return { success: false, error: 'Valid Contest ID is required' }
    }

    const response = await backendApiRequest<any>(event, `/api/contests/${id}`, {
      method: 'DELETE'
    })

    return response
  } catch (error: any) {
    return handleApiError(error, 'handle delete contest')
  }
})
