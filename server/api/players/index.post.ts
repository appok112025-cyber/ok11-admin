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
    const body = await readBody(event)
    const payload = body.data || body

    const response = await backendApiRequest<any>(event, '/api/players', {
      method: 'POST',
      body: payload,
    })

    return {
      data: response.data || response,
      meta: response.meta || {},
    }
  } catch (error: any) {
    return handleApiError(error, 'create player')
  }
})
