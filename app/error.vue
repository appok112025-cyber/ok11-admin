<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-gray-200">
          {{ error?.statusCode || '404' }}
        </h1>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          {{ error?.statusMessage || 'Page Not Found' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{
            error?.message ||
            "Sorry, we couldn't find the page you're looking for."
          }}
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>

          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{
              error?.statusCode === 404
                ? 'Page Not Found'
                : 'Something went wrong'
            }}
          </h3>

          <p class="text-sm text-gray-500 mb-6">
            {{
              error?.statusCode === 404
                ? "The page you requested doesn't exist or has been moved."
                : 'An unexpected error occurred. Please try again.'
            }}
          </p>

          <div class="space-y-3">
            <button
              @click="handleError"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              Go Home
            </button>

            <button
              @click="goBack"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NuxtError } from '#app'

  const props = defineProps<{
    error: NuxtError
  }>()

  const handleError = () => {
    clearError({ redirect: '/' })
  }

  const goBack = () => {
    if (process.client && window.history.length > 1) {
      window.history.back()
    } else {
      clearError({ redirect: '/' })
    }
  }

  useHead({
    title: `${props.error?.statusCode || '404'} - ${props.error?.statusMessage || 'Page Not Found'}`,
  })
</script>
