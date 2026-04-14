import { backendApiRequest } from '../../utils/backendApi'
import { requireAuth } from '../../utils/api'

export default defineEventHandler(async event => {
  try {
    requireAuth(event)

    await backendApiRequest(event, '/api/auth/admin/logout', {
      method: 'POST',
    })

    deleteCookie(event, 'refreshToken')
    deleteCookie(event, 'auth_user')
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'auth_expires')

    return {
      success: true,
      message: 'Logout successful',
    }
  } catch (error: any) {
    deleteCookie(event, 'refreshToken')
    deleteCookie(event, 'auth_user')
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'auth_expires')

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed',
    })
  }
})
