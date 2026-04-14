import type { UserResponse } from '@/types/user'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  try {
    requireAuth(event)

    const authUser = getCookie(event, 'auth_user')
    if (authUser) {
      const user = JSON.parse(authUser)
      return {
        id: parseInt(user.id),
        email: user.email,
        username: user.name,
        role: {
          id: 1,
          name: user.role,
          description: 'Administrator',
          type: user.role,
        },
      }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  } catch (error: any) {
    return handleApiError(error, 'fetch user data')
  }
})
