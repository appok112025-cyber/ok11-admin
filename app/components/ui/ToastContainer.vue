<template>
  <div
    class="fixed top-4 left-4 right-4 z-[9999] space-y-2 sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm lg:max-w-md xl:max-w-lg"
  >
    <TransitionGroup name="toast" tag="div" class="space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          'transform transition-all duration-300 ease-in-out',
          'min-w-0 max-w-full',
        ]"
      >
        <div class="p-4">
          <div class="flex items-start min-w-0">
            <div class="flex-shrink-0">
              <XCircleIcon
                v-if="toast.type === 'error'"
                class="h-5 w-5 text-red-400"
              />
              <CheckCircleIcon
                v-else-if="toast.type === 'success'"
                class="h-5 w-5 text-green-400"
              />
              <ExclamationTriangleIcon
                v-else-if="toast.type === 'warning'"
                class="h-5 w-5 text-yellow-400"
              />
              <InformationCircleIcon v-else class="h-5 w-5 text-blue-400" />
            </div>
            <div class="ml-3 min-w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900 break-words">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                @click="removeToast(toast.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div
          :class="[
            'h-1 bg-gradient-to-r transition-all duration-300',
            getProgressColor(toast.type),
          ]"
          :style="{ width: `${getProgressWidth(toast.id)}%` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  import XCircleIcon from '~/components/icons/XCircleIcon.vue'
  import CheckCircleIcon from '~/components/icons/CheckCircleIcon.vue'
  import ExclamationTriangleIcon from '~/components/icons/ExclamationTriangleIcon.vue'
  import InformationCircleIcon from '~/components/icons/InformationCircleIcon.vue'

  interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }

  interface Props {
    toasts?: readonly Toast[]
  }

  const props = withDefaults(defineProps<Props>(), {
    toasts: () => [],
  })
  const emit = defineEmits<{
    remove: [id: string]
  }>()

  const progressMap = ref<Map<string, number>>(new Map())

  const removeToast = (id: string) => {
    emit('remove', id)
  }

  const getProgressColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-green-600'
      case 'error':
        return 'from-red-500 to-red-600'
      case 'warning':
        return 'from-yellow-500 to-yellow-600'
      case 'info':
        return 'from-blue-500 to-blue-600'
      default:
        return 'from-blue-500 to-blue-600'
    }
  }

  const getProgressWidth = (id: string) => {
    return progressMap.value.get(id) || 100
  }

  // Progress animation
  watch(
    () => props.toasts,
    (newToasts: readonly Toast[]) => {
      newToasts.forEach(toast => {
        if (!progressMap.value.has(toast.id)) {
          progressMap.value.set(toast.id, 100)

          const duration = toast.duration || 5000
          const interval = 50
          const steps = duration / interval
          const decrement = 100 / steps

          const timer = setInterval(() => {
            const current = progressMap.value.get(toast.id) || 0
            if (current <= 0) {
              clearInterval(timer)
              progressMap.value.delete(toast.id)
            } else {
              progressMap.value.set(toast.id, Math.max(0, current - decrement))
            }
          }, interval)
        }
      })
    },
    { immediate: true }
  )

  // Clean up progress map when toasts are removed
  watch(
    () => props.toasts.length,
    (newLength: number, oldLength: number) => {
      if (newLength < oldLength) {
        const currentIds = new Set(props.toasts.map(t => t.id))
        for (const [id] of progressMap.value) {
          if (!currentIds.has(id)) {
            progressMap.value.delete(id)
          }
        }
      }
    }
  )
</script>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }

  .toast-move {
    transition: transform 0.3s ease;
  }

  /* Add a subtle bounce effect for better visibility */
  .toast-enter-active {
    animation: toast-bounce 0.3s ease-out;
  }

  @keyframes toast-bounce {
    0% {
      transform: translateX(100%) scale(0.95);
      opacity: 0;
    }

    50% {
      transform: translateX(0%) scale(1.02);
      opacity: 0.8;
    }

    100% {
      transform: translateX(0%) scale(1);
      opacity: 1;
    }
  }
</style>
