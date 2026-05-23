import type { ApiResponse } from '@/types/api'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'
import mongoose from 'mongoose'

const getMongoUri = () => {
  return process.env.MONGODB_URI || 'mongodb://mongo:HDiNmhmNGwDJDQEPpUQZWfurcuLVYCgx@mongodb.railway.internal:27017/ok11?authSource=admin'
}

export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  try {
    requireAuth(event)

    const query = getQuery(event)
    const response = await backendApiRequest<any>(event, '/api/players', {
      method: 'GET',
      query,
    })

    const result = response.data || response

    return {
      data: result.players || result,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit
      }
    }
  } catch (error: any) {
    return handleApiError(error, 'fetch players')
  }
})
