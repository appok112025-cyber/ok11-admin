import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)
    const body = await readBody(event)
    const payload = body?.data || body || {}
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const imageUrl =
      typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : ''

    if (!name) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Team name is required',
      })
    }

    if (!imageUrl) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Team image is required',
      })
    }

    const response = await backendApiRequest<any>(event, '/api/teams', {
      method: 'POST',
      body: {
        ...payload,
        name,
        imageUrl,
      },
    })

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'create team')
  }
})
