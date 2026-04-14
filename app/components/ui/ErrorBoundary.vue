<template>
  <div
    v-if="hasError"
    class="min-h-screen flex items-center justify-center bg-gray-50 px-4"
  >
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
      <div
        class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4"
      >
        <svg
          class="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900 text-center mb-2">
        Something went wrong
      </h2>
      <p class="text-gray-600 text-center mb-6">
        {{ errorMessage }}
      </p>
      <div class="flex gap-3">
        <button
          @click="resetError"
          class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          @click="goHome"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
  const hasError = ref(false)
  const errorMessage = ref('An unexpected error occurred')

  const resetError = () => {
    hasError.value = false
    errorMessage.value = 'An unexpected error occurred'
    window.location.reload()
  }

  const goHome = () => {
    navigateTo('/')
  }

  onErrorCaptured((err: any) => {
    hasError.value = true
    errorMessage.value =
      err.message || err.statusMessage || 'An unexpected error occurred'
    return false
  })
</script>
