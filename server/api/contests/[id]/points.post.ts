import { requireAuth, handleApiError, requireParam } from '../../../utils/api'
import { backendApiRequest } from '../../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')
    const body = await readBody(event)

    const response = await backendApiRequest<any>(event, `/api/contests/${id}/points`, {
      method: 'POST',
      body,
    })

    return response
  } catch (error: any) {
    return handleApiError(error, 'update contest points')
  }
})
