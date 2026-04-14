import type { ApiResponse } from '@/types/api'
import type { UserWithMatches } from '@/types/user'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<UserWithMatches[]>> => {
    try {
      requireAuth(event)

      const query = getQuery(event)
      const response = await backendApiRequest<any>(event, '/api/users', {
        method: 'GET',
        query,
      })

      const pagination =
        response.pagination ||
        response.data?.pagination ||
        response.meta?.pagination
      const usersData = response.data?.data || response.data || []

      const transformedUsers = Array.isArray(usersData)
        ? usersData.map((user: any) => ({
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
          }))
        : []

      return {
        data: transformedUsers,
        meta: {
          pagination: pagination
            ? {
                page: pagination.page || 1,
                pageSize: pagination.limit || pagination.pageSize || 10,
                pageCount: pagination.totalPages || pagination.pageCount || 0,
                total: pagination.total || 0,
              }
            : undefined,
        },
      }
    } catch (error: any) {
      return handleApiError(error, 'fetch users')
    }
  }
)
