import type { H3Event } from 'h3'

const getApiUrl = (): string => {
  // Prioritize process.env.API_URL (set in docker-compose as http://api:5925)
  if (process.env.API_URL) {
    return process.env.API_URL
  }

  // Fallback to runtime config
  try {
    const config = useRuntimeConfig()
    if (config.apiUrl) {
      return config.apiUrl
    }
  } catch (e) {
    // Runtime config not available
  }

  // Final fallback for local development
  return 'http://127.0.0.1:5925'
}

export const backendApiRequest = async <T>(
  event: H3Event,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: any
    headers?: Record<string, string>
    query?: Record<string, any>
  } = {}
): Promise<T> => {
  const apiUrl = getApiUrl()
  const token = getCookie(event, 'auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const queryString = options.query
    ? '?' + new URLSearchParams(options.query).toString()
    : ''

  const url = `${apiUrl}${endpoint}${queryString}`

  try {
    const response = await $fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeout: 30000,
    })

    return response as T
  } catch (error: any) {
    const isNetworkError =
      !error.status &&
      (error.message?.includes('fetch failed') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('timeout') ||
        error.cause?.code === 'ECONNREFUSED' ||
        error.cause?.code === 'ENOTFOUND' ||
        error.cause?.code === 'ETIMEDOUT')

    if (isNetworkError) {
      console.error('Backend API connection failed:', {
        url,
        method: options.method || 'GET',
        message: error.message,
        cause: error.cause?.code || error.cause?.message,
      })

      throw createError({
        statusCode: 503,
        statusMessage:
          'Service temporarily unavailable. Please try again later.',
        data: {
          type: 'network_error',
          originalMessage: error.message,
        },
      })
    }

    if (error.status === 401) {
      const errorMessage =
        error.data?.error || error.data?.message || 'Invalid credentials'
      throw createError({
        statusCode: 401,
        statusMessage: errorMessage,
        data: error.data,
      })
    }

    if (error.status === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: error.data?.message || 'Access forbidden',
        data: error.data,
      })
    }

    if (error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: error.data?.message || 'Resource not found',
        data: error.data,
      })
    }

    if (error.status === 422) {
      throw createError({
        statusCode: 422,
        statusMessage:
          error.data?.message || error.data?.error || 'Validation failed',
        data: error.data,
      })
    }

    if (error.status >= 500) {
      console.error('Backend API server error:', {
        url,
        method: options.method || 'GET',
        status: error.status,
        message: error.message,
        data: error.data,
      })

      throw createError({
        statusCode: 502,
        statusMessage: 'Service error. Please try again later.',
        data: {
          type: 'backend_error',
          originalStatus: error.status,
        },
      })
    }

    if (error.data) {
      throw createError({
        statusCode: error.status || 500,
        statusMessage:
          error.data.message || error.data.error || 'Request failed',
        data: error.data,
      })
    }

    console.error('Backend API request failed:', {
      url,
      method: options.method || 'GET',
      status: error.status,
      message: error.message,
      data: error.data,
    })

    throw createError({
      statusCode: error.status || 500,
      statusMessage: 'An unexpected error occurred. Please try again.',
    })
  }
}
