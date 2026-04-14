<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md md:max-w-lg lg:max-w-xl space-y-8">
      <div class="text-center">
        <img
          class="mx-auto h-16 w-auto"
          src="/assets/icons/logo.png"
          alt="Logo"
        />
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">OK11</h2>
        <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>

      <form
        class="mt-8 space-y-6"
        method="post"
        action="javascript:void(0);"
        autocomplete="off"
        @submit.prevent="handleSubmit"
        :class="{ 'pointer-events-none opacity-75': isSubmitting }"
        :aria-disabled="isSubmitting"
      >
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                :disabled="isSubmitting"
                :readonly="isSubmitting"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  emailError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="Enter your email"
                @blur="validateEmail"
                @input="clearEmailError"
              />
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">
              {{ emailError }}
            </p>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="isSubmitting"
                :readonly="isSubmitting"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  passwordError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300',
                ]"
                placeholder="Enter your password"
                @blur="validatePassword"
                @input="clearPasswordError"
              />
            </div>
            <div class="mt-1 flex items-center justify-between">
              <button
                type="button"
                :disabled="isSubmitting"
                :aria-disabled="isSubmitting"
                class="text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }} password
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">
              {{ passwordError }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              :disabled="isSubmitting"
              :aria-disabled="isSubmitting"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || hasErrors"
            :aria-disabled="isSubmitting || hasErrors"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span
              v-if="isSubmitting"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Toast Container -->
    <ToastContainer :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
  import type { LoginForm } from '~/types/auth'

  definePageMeta({
    layout: 'default',
  })

  const authStore = useAuthStore()
  const {
    success: showSuccess,
    error: showError,
    toasts,
    removeToast,
  } = useToast()

  const form = ref<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const emailError = ref<string>('')
  const passwordError = ref<string>('')
  const showPassword = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)

  // Redirect if already authenticated and clean URL
  onMounted(() => {
    // Security: Remove any credentials from URL query parameters
    if (process.client && window.location.search) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }

    if (authStore.isAuthenticated) {
      navigateTo('/')
    }
  })

  const validateEmail = () => {
    const email = form.value.email.trim()

    if (!email) {
      emailError.value = 'Email is required'
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      emailError.value = 'Please enter a valid email address'
      return false
    }

    emailError.value = ''
    return true
  }

  const validatePassword = () => {
    const password = form.value.password

    if (!password) {
      passwordError.value = 'Password is required'
      return false
    }

    if (password.length < 6) {
      passwordError.value = 'Password must be at least 6 characters long'
      return false
    }

    passwordError.value = ''
    return true
  }

  const clearEmailError = () => {
    if (emailError.value) {
      emailError.value = ''
    }
  }

  const clearPasswordError = () => {
    if (passwordError.value) {
      passwordError.value = ''
    }
  }

  const hasErrors = computed(() => {
    return !!emailError.value || !!passwordError.value
  })

  const resetFormState = () => {
    isSubmitting.value = false
    emailError.value = ''
    passwordError.value = ''
  }

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting.value) {
      return
    }

    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    isSubmitting.value = true

    try {
      const result = await authStore.login({
        email: form.value.email.trim(),
        password: form.value.password,
        rememberMe: form.value.rememberMe,
      })

      if (result.success) {
        showSuccess('Login successful! Redirecting...')

        // Clear form
        form.value = {
          email: '',
          password: '',
          rememberMe: false,
        }

        // Redirect to home page after a short delay
        setTimeout(() => {
          navigateTo('/')
        }, 1000)
      } else {
        showError(result.message || 'Invalid email or password')
        // Re-enable form on error
        resetFormState()
      }
    } catch (error) {
      console.error('Login error:', error)
      showError('An unexpected error occurred. Please try again.')
      // Re-enable form on error
      resetFormState()
    }
  }
</script>
