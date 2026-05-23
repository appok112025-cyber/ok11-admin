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
    const normalizedQuery = { ...query }

    if (!normalizedQuery.limit && !normalizedQuery.pageSize) {
      normalizedQuery.limit = '1000'
      normalizedQuery.pageSize = '1000'
    }

    const response = await backendApiRequest<any>(event, '/api/players', {
      method: 'GET',
      query: normalizedQuery,
    })

    const result = response?.data || response
    const playersData = Array.isArray(result)
      ? result
      : Array.isArray(result?.players)
        ? result.players
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.players?.data)
            ? result.players.data
            : []

    const pagination =
      result?.pagination ||
      result?.meta?.pagination ||
      response?.pagination ||
      response?.meta?.pagination

    return {
      data: playersData,
      meta: pagination
        ? {
            pagination: {
              page: pagination.page || 1,
              pageSize: pagination.limit || pagination.pageSize || 100,
              pageCount: pagination.totalPages || pagination.pageCount || 1,
              total: pagination.total || playersData.length,
            },
          }
        : undefined,
    }
  } catch (error: any) {
    return handleApiError(error, 'fetch players')
  }
})
