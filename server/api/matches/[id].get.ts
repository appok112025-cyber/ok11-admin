import { requireAuth, handleApiError, requireParam } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')

    const response = await backendApiRequest<any>(event, `/api/matches/${id}`, {
      method: 'GET',
    })

    // Support both Strapi-style { data: {...} } and direct object responses
    const matchData = response?.data || response

    return {
      data: matchData
    }
  } catch (error: any) {
    return handleApiError(error, 'fetch match')
  }
})
