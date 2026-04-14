import type { SiteContentResponse } from '@/types/site-content'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<SiteContentResponse> => {
    try {
      requireAuth(event)
      const body = await readBody(event)

      // Determine which endpoint to call based on the content being updated
      const data = body.data || body
      let endpoint = '/api/site-content'
      let requestBody: any = {}

      if (data.about && !data.points && !data.terms) {
        endpoint = '/api/site-content/about'
        const aboutData =
          typeof data.about === 'object'
            ? data.about
            : { content: data.about, links: [] }
        requestBody = {
          content: aboutData.content || '',
          links: Array.isArray(aboutData.links) ? aboutData.links : [],
        }
      } else if (data.points && !data.about && !data.terms) {
        endpoint = '/api/site-content/points'
        const pointsData =
          typeof data.points === 'object'
            ? data.points
            : { content: data.points, items: [] }
        // Ensure items is always an array (can be empty when all points are deleted)
        const items = Array.isArray(pointsData.items) ? pointsData.items : []
        requestBody = {
          content: pointsData.content || '',
          items: items, // Can be empty array
        }
      } else if (data.terms && !data.about && !data.points) {
        endpoint = '/api/site-content/terms'
        const termsData =
          typeof data.terms === 'object'
            ? data.terms
            : { content: data.terms, items: [] }
        requestBody = {
          content: termsData.content || '',
          items: Array.isArray(termsData.items) ? termsData.items : [],
        }
      } else {
        // Default to first non-empty field
        if (data.about) {
          endpoint = '/api/site-content/about'
          const aboutData =
            typeof data.about === 'object'
              ? data.about
              : { content: data.about, links: [] }
          requestBody = {
            content: aboutData.content || '',
            links: Array.isArray(aboutData.links) ? aboutData.links : [],
          }
        } else if (data.points) {
          endpoint = '/api/site-content/points'
          const pointsData =
            typeof data.points === 'object'
              ? data.points
              : { content: data.points, items: [] }
          // Ensure items is always an array (can be empty when all points are deleted)
          const items = Array.isArray(pointsData.items) ? pointsData.items : []
          requestBody = {
            content: pointsData.content || '',
            items: items, // Can be empty array
          }
        } else if (data.terms) {
          endpoint = '/api/site-content/terms'
          const termsData =
            typeof data.terms === 'object'
              ? data.terms
              : { content: data.terms, items: [] }
          requestBody = {
            content: termsData.content || '',
            items: Array.isArray(termsData.items) ? termsData.items : [],
          }
        }
      }

      const response = await backendApiRequest<any>(event, endpoint, {
        method: 'PUT',
        body: requestBody,
      })

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      return handleApiError(error, 'update site content')
    }
  }
)
