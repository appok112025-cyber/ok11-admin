import type {
  User,
  AuthTokens,
  LoginCredentials,
  LoginResponse,
} from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const isAuthenticated = computed(
    () => !!user.value && !!tokens.value && !isTokenExpired()
  )
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Check if token is expired
  const isTokenExpired = () => {
    if (!tokens.value) return true
    const currentTime = Math.floor(Date.now() / 1000)
    return tokens.value.expiresIn < currentTime
  }

  const validateToken = async () => {
    if (!tokens.value?.token) return false

    try {
      await $fetch('/api/users/me')
      return true
    } catch (error) {
      return false
    }
  }

  // Initialize auth state from localStorage and cookies
  const initializeAuth = () => {
    if (!isInitialized.value) {
      // Try to get from localStorage first (client-side)
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = window.localStorage.getItem('auth_user')
        const storedTokens = window.localStorage.getItem('auth_tokens')

        if (storedUser && storedTokens) {
          try {
            user.value = JSON.parse(storedUser)
            tokens.value = JSON.parse(storedTokens)

            // Check if token is expired
            if (isTokenExpired()) {
              logout()
              return
            }
          } catch (error) {
            console.error('Failed to parse stored auth data:', error)
            logout()
            return
          }
        }
      }

      // Try to get from cookies (works on both server and client)
      const cookieUser = useCookie('auth_user')
      const cookieToken = useCookie('auth_token')
      const cookieExpires = useCookie('auth_expires')

      if (cookieUser.value && cookieToken.value && cookieExpires.value) {
        try {
          // Handle case where cookieUser.value might already be an object
          let userData
          if (typeof cookieUser.value === 'string') {
            userData = JSON.parse(cookieUser.value)
          } else if (
            typeof cookieUser.value === 'object' &&
            cookieUser.value !== null
          ) {
            userData = cookieUser.value
          } else {
            throw new Error('Invalid user data type')
          }

          user.value = userData
          tokens.value = {
            token: cookieToken.value,
            refreshToken: '', // Refresh token is httpOnly, not accessible here
            expiresIn: parseInt(cookieExpires.value),
          }

          // Check if token is expired
          if (isTokenExpired()) {
            logout()
            return
          }
        } catch (error) {
          console.error('Failed to parse cookie auth data:', error)
          logout()
          return
        }
      }

      isInitialized.value = true
    }
  }

  // Save auth state to localStorage and cookies
  const saveAuthState = () => {
    if (user.value && tokens.value) {
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_user', JSON.stringify(user.value))
        window.localStorage.setItem('auth_tokens', JSON.stringify(tokens.value))
      }

      // Save to cookies (works on both server and client)
      const cookieUser = useCookie('auth_user', {
        maxAge: 24 * 60 * 60, // 24 hours default
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      const cookieToken = useCookie('auth_token', {
        maxAge: 24 * 60 * 60, // 24 hours default
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      const cookieExpires = useCookie('auth_expires', {
        maxAge: 24 * 60 * 60, // 24 hours default
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      // Ensure we're setting strings, not objects
      cookieUser.value = JSON.stringify(user.value)
      cookieToken.value = tokens.value.token
      cookieExpires.value = tokens.value.expiresIn.toString()
    }
  }

  // Clear auth state from localStorage and cookies
  const clearAuthState = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('auth_user')
      window.localStorage.removeItem('auth_tokens')
    }

    const cookieUser = useCookie('auth_user')
    const cookieToken = useCookie('auth_token')
    const cookieExpires = useCookie('auth_expires')

    cookieUser.value = null
    cookieToken.value = null
    cookieExpires.value = null
  }

  // Login function
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true

    try {
      const response = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (response.success && response.data) {
        user.value = response.data.user
        tokens.value = {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        }
        saveAuthState()
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error: any) {
      console.error('Login error:', error)

      let message = 'An unexpected error occurred. Please try again.'

      if (error.status === 401) {
        message = error.data?.message || 'Invalid email or password'
      } else if (error.status === 400) {
        message =
          error.data?.message || 'Invalid request. Please check your input.'
      } else if (error.status === 403) {
        message = 'Access forbidden. Please contact support.'
      } else if (error.status === 422) {
        message =
          error.data?.message || 'Validation failed. Please check your input.'
      } else if (error.status === 429) {
        message = 'Too many login attempts. Please try again later.'
      } else if (error.status === 502) {
        message =
          error.data?.message || 'Service error. Please try again later.'
      } else if (error.status === 503) {
        message =
          error.data?.message ||
          'Service temporarily unavailable. Please try again later.'
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.'
      } else if (error.statusMessage) {
        message = error.statusMessage
      }

      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    }

    user.value = null
    tokens.value = null
    clearAuthState()

    // Redirect to login page
    if (process.client) {
      navigateTo('/login')
    }
  }

  // Get auth token for API requests
  const getAuthToken = () => {
    return tokens.value?.token || null
  }

  // Check if user has specific role
  const hasRole = (role: string) => {
    return user.value?.role === role
  }

  // Check if user is admin
  const isAdmin = computed(() => hasRole('admin'))

  // Initialize auth on store creation
  initializeAuth()

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isInitialized,
    isAdmin,
    login,
    logout,
    getAuthToken,
    hasRole,
    initializeAuth,
    validateToken,
  }
})
