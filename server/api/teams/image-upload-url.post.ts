import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)

    const body = await readBody(event)
    const payload = body?.data || body || {}

    const contentType =
      typeof payload.contentType === 'string' ? payload.contentType : ''
    const fileName =
      typeof payload.fileName === 'string' ? payload.fileName : ''
    const fileSize = typeof payload.fileSize === 'number' ? payload.fileSize : 0
    const path = typeof payload.path === 'string' ? payload.path : 'teams'

    if (!contentType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'contentType is required',
      })
    }

    if (!fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fileName is required',
      })
    }

    if (!fileSize || fileSize <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fileSize is required',
      })
    }

    const response = await backendApiRequest<any>(
      event,
      '/api/teams/image-upload-url',
      {
        method: 'POST',
        body: {
          contentType,
          fileName,
          fileSize,
          path,
        },
      }
    )

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'get team image upload url')
  }
})
