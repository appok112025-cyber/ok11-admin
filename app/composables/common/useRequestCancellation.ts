import { onUnmounted, ref } from 'vue'

export const useRequestCancellation = () => {
  const abortController = ref<AbortController | null>(null)

  const createAbortController = () => {
    // Cancel previous request if exists
    if (abortController.value) {
      abortController.value.abort()
    }

    abortController.value = new AbortController()
    return abortController.value
  }

  const cancel = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  onUnmounted(() => {
    cancel()
  })

  return {
    createAbortController,
    cancel,
    signal: () => abortController.value?.signal,
  }
}
