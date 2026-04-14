import type { UserWithMatches } from '@/types/user'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<UserWithMatches> => {
  try {
    requireAuth(event)
    const id = requireParam(event, 'id')

    const response = await backendApiRequest<any>(event, `/api/users/${id}`, {
      method: 'GET',
    })

    const user = response.data || response

    return {
      id: user._id?.toString() || user.id?.toString() || '',
      name:
        user.displayName ||
        user.name ||
        (user.email ? user.email.split('@')[0] : null) ||
        null,
      email: user.email || '',
      phone: user.phone || null,
      photoURL: user.photoURL || null,
      lastLoggedIn: user.lastLoginAt
        ? new Date(user.lastLoginAt).toISOString()
        : user.lastLoggedIn || null,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : user.createdAt || '',
      appVersion: user.appVersion || null,
      matches: user.matches || [],
      blocked: user.blocked || false,
    }
  } catch (error: any) {
    return handleApiError(error, 'fetch user')
  }
})
