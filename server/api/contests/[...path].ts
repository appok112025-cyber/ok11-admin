import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const method = event.method.toUpperCase()
    const path = event.path.replace(/^\/api\/contests/, '')
    const query = getQuery(event)
    const body = method !== 'GET' ? await readBody(event) : undefined

    const response = await backendApiRequest<any>(event, `/api/contests${path}`, {
      method: method as any,
      query,
      body,
    })

    return {
      data: response
    }
  } catch (error: any) {
    return handleApiError(error, 'handle contest proxy')
  }
})
