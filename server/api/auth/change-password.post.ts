import { backendApiRequest } from '../../utils/backendApi'
import { requireAuth } from '../../utils/api'

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
}

export default defineEventHandler(
  async (event): Promise<ChangePasswordResponse> => {
    try {
      requireAuth(event)

      const body = await readBody<ChangePasswordRequest>(event)

      const { currentPassword, newPassword, confirmPassword } = body

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'All password fields are required',
        })
      }

      const response = await backendApiRequest<{
        success: boolean
        message: string
      }>(event, '/api/auth/admin/change-password', {
        method: 'POST',
        body: {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      })

      if (!response.success) {
        throw createError({
          statusCode: 400,
          statusMessage: response.message || 'Failed to change password',
        })
      }

      return {
        success: true,
        message: response.message || 'Password changed successfully',
      }
    } catch (error: any) {
      if (error.statusCode) {
        throw error
      }

      console.error('Change password error:', {
        message: error.message,
        stack: error.stack,
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred. Please try again.',
      })
    }
  }
)
