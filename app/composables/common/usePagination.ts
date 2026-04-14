export const usePagination = <T>(items: Ref<T[]>, initialItemsPerPage = 10) => {
  const currentPage = ref(1)
  const itemsPerPage = ref(initialItemsPerPage)
  const isChangingPage = ref(false)

  const totalItems = computed(() => items.value.length)
  const totalPages = computed(() =>
    Math.ceil(totalItems.value / itemsPerPage.value)
  )

  const startIndex = computed(
    () => (currentPage.value - 1) * itemsPerPage.value
  )
  const endIndex = computed(() =>
    Math.min(startIndex.value + itemsPerPage.value, totalItems.value)
  )

  const paginatedItems = computed(() => {
    const start = startIndex.value
    const end = startIndex.value + itemsPerPage.value
    return items.value.slice(start, end)
  })

  const visiblePages = computed(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      isChangingPage.value = true
      currentPage.value = page
      if (process.client) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => {
        isChangingPage.value = false
      }, 200)
    }
  }

  watch(itemsPerPage, () => {
    currentPage.value = 1
  })

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    visiblePages,
    isChangingPage,
    goToPage,
  }
}
