import type { UserResponse } from '@/types/user'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')
    const body = await readBody(event)

    const endpoint =
      body.blocked !== undefined
        ? `/api/users/${id}/${body.blocked ? 'block' : 'unblock'}`
        : `/api/users/${id}`

    const response = await backendApiRequest<any>(event, endpoint, {
      method: 'PUT',
      body: body.blocked === undefined ? body : undefined,
    })

    return response.data || response
  } catch (error: any) {
    return handleApiError(error, 'update user')
  }
})
