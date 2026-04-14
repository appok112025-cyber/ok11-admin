export const useFormState = <T extends Record<string, any>>(
  initialData: T,
  loadData?: () => Promise<T> | T
) => {
  const formData = ref<T>({ ...initialData } as T)
  const originalData = ref<T>({ ...initialData } as T)
  const isLoading = ref(false)
  const loading = ref(true)

  const hasChanges = computed(() => {
    return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
  })

  const initializeData = async () => {
    loading.value = true
    try {
      const data = loadData ? await loadData() : initialData
      formData.value = JSON.parse(JSON.stringify(data))
      originalData.value = JSON.parse(JSON.stringify(data))
    } finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    formData.value = JSON.parse(JSON.stringify(originalData.value))
  }

  const updateOriginal = () => {
    originalData.value = JSON.parse(JSON.stringify(formData.value))
  }

  return {
    formData,
    originalData,
    isLoading,
    loading,
    hasChanges,
    initializeData,
    resetForm,
    updateOriginal,
  }
}
