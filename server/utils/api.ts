export const requireAuth = (event: any): string => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
  return token
}

export const requireParam = (event: any, paramName: string): string => {
  const param = getRouterParam(event, paramName)
  if (!param) {
    throw createError({
      statusCode: 400,
      statusMessage: `${paramName} is required`,
    })
  }
  return param
}

export const handleApiError = (error: any, context: string): never => {
  if (error.statusCode) {
    throw error
  }

  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
  })

  throw createError({
    statusCode: 500,
    statusMessage: 'An unexpected error occurred. Please try again.',
  })
}
