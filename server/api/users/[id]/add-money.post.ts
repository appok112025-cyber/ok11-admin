import { requireAuth, requireParam, handleApiError } from '../../../utils/api'
import { backendApiRequest } from '../../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')
    const body = await readBody(event)

    const response = await backendApiRequest<any>(event, `/api/users/${id}/add-money`, {
      method: 'POST',
      body,
    })

    return response.data || response
  } catch (error: any) {
    return handleApiError(error, 'add money to user')
  }
})
