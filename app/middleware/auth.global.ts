export default defineNuxtRouteMiddleware(to => {
  const isLoginRoute = to.path === '/login'

  if (import.meta.server) {
    const cookieToken = useCookie('auth_token')
    const isAuthenticated = !!cookieToken.value

    if (!isAuthenticated && !isLoginRoute) {
      return navigateTo('/login', { redirectCode: 302 })
    }
    if (isAuthenticated && isLoginRoute) {
      return navigateTo('/', { redirectCode: 302 })
    }
    return
  }

  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (!isAuthenticated && !isLoginRoute) {
    return navigateTo('/login')
  }
  if (isAuthenticated && isLoginRoute) {
    return navigateTo('/')
  }
})
