import { requireAuth, handleApiError, requireParam } from '../../../utils/api'
import { backendApiRequest } from '../../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')

    const response = await backendApiRequest<any>(event, `/api/contests/${id}/pay-all-prizes`, {
      method: 'POST',
    })

    return {
      data: response
    }
  } catch (error: any) {
    return handleApiError(error, 'process contest pay all prizes')
  }
})
