export interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
  retryCondition?: (error: any) => boolean
}

const defaultRetryCondition = (error: any): boolean => {
  // Retry on network errors or 5xx server errors
  if (!error.status) return true // Network error
  return error.status >= 500 && error.status < 600
}

export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryCondition = defaultRetryCondition,
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry if condition is not met
      if (!retryCondition(error)) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break
      }

      // Calculate delay with exponential backoff if enabled
      const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay

      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }

  throw lastError
}
