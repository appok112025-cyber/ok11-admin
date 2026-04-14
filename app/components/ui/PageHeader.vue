<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
  >
    <div class="flex items-start gap-3 flex-1">
      <MobileMenuButton v-if="showMobileMenu" />
      <button
        v-if="showBackButton"
        @click="handleBack"
        aria-label="Go back"
        class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex-shrink-0"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-900"
          :class="titleClass"
        >
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm"
        >
          {{ description }}
        </p>
      </div>
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    title: string
    description?: string
    showMobileMenu?: boolean
    showBackButton?: boolean
    titleClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    showMobileMenu: true,
    showBackButton: false,
    titleClass: '',
  })

  const emit = defineEmits<{
    back: []
  }>()

  const router = useRouter()

  const handleBack = () => {
    emit('back')
    router.back()
  }
</script>
