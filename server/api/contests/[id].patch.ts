import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = event.context.params?.id
    const body = await readBody(event)

    const response = await backendApiRequest<any>(event, `/api/contests/${id}`, {
      method: 'PATCH',
      body,
    })

    return response
  } catch (error: any) {
    return handleApiError(error, 'update contest')
  }
})
