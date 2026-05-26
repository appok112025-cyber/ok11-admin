import { defineEventHandler, getQuery, readBody } from 'h3'
import { backendApiRequest } from '../../utils/backendApi'
import { requireAuth } from '../../utils/api'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const method = event.method.toUpperCase()

    if (method === 'GET') {
      const query = getQuery(event)
      const matchId = query.matchId as string
      
      // Call the standardized backend endpoint
      const url = matchId ? `/api/contests?matchId=${matchId}` : '/api/contests'
      const response = await backendApiRequest<any>(event, url)
      
      // Handle the standardized backend response format: { success: true, data: { data: [...] } }
      if (response && response.success && response.data) {
        return {
          success: true,
          data: response.data.data || []
        }
      }

      return {
        success: true,
        data: []
      }
    }

    if (method === 'POST') {
      const body = await readBody(event)
      
      // Standardized POST to /api/contests
      const response = await backendApiRequest<any>(event, '/api/contests', {
        method: 'POST',
        body
      })

      return response
    }

    return { error: 'Method not supported' }
  } catch (error: any) {
    console.error('Error in contest handler:', error)
    return {
      success: false,
      error: error.message || 'Internal Server Error'
    }
  }
})
