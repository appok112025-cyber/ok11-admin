import type { TempFaq } from '~/types/faq'
import { retry } from '~/utils/common/retry'
import { validateRequired } from '~/utils/validation/validation'
import { getApiErrorMessage, useApi } from '~/utils/api/api'
import { useRequestCancellation } from '../common/useRequestCancellation'
import { useToast } from '../common/useToast'

export const useFaqs = () => {
  const { getFaqs, createFaq, updateFaq, deleteFaq } = useApi()
  const { success, error: showError } = useToast()
  const { createAbortController } = useRequestCancellation()

  const faqs = ref<TempFaq[]>([])
  const loading = ref(true)
  const showModal = ref(false)
  const isEditing = ref(false)
  const submitting = ref(false)
  const editingIndex = ref<number | null>(null)
  const showDeleteDialog = ref(false)
  const deleteIndex = ref<number | null>(null)
  const isDragging = ref(false)
  const draggedIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)

  const form = ref({
    question: '',
    answer: '',
  })

  const loadFaqs = async () => {
    loading.value = true
    const abortController = createAbortController()

    try {
      const response = await retry(() => getFaqs(), {
        maxRetries: 2,
        retryCondition: (err: any) => {
          if (abortController.signal.aborted) return false
          return !err.status || (err.status >= 500 && err.status < 600)
        },
      })

      if (abortController.signal.aborted) return

      // Handle edge cases: null, undefined, or empty data
      if (response?.data) {
        // Ensure data is an array
        if (Array.isArray(response.data)) {
          faqs.value = response.data
            .filter(faq => faq != null) // Filter out null/undefined items
            .map(faq => ({
              id:
                faq._id?.toString() ||
                faq.id?.toString() ||
                faq.documentId ||
                Date.now().toString() + Math.random(),
              order: faq.order ?? 0,
              question: faq.question ?? '',
              answer: faq.answer ?? '',
            }))
        } else {
          // If data is not an array, initialize as empty array
          faqs.value = []
          console.warn('API returned non-array data for FAQs')
        }
      } else {
        // No data returned - initialize as empty array
        faqs.value = []
      }
    } catch (err: any) {
      if (abortController.signal.aborted) return

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
    } finally {
      if (!abortController.signal.aborted) {
        loading.value = false
      }
    }
  }

  const updateOrder = () => {
    faqs.value.forEach((faq, index) => {
      faq.order = index + 1
    })
  }

  const handleDragStart = (index: number, event: DragEvent) => {
    if (!event.dataTransfer) return
    isDragging.value = true
    draggedIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', index.toString())
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '0.5'
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (dropIndex: number, event: DragEvent) => {
    event.preventDefault()
    if (draggedIndex.value === null || draggedIndex.value === dropIndex) return

    const draggedItem = faqs.value[draggedIndex.value]
    if (!draggedItem) return

    faqs.value.splice(draggedIndex.value, 1)
    faqs.value.splice(dropIndex, 0, draggedItem)
    updateOrder()
    success('FAQ order updated')
  }

  const handleDragEnd = () => {
    isDragging.value = false
    draggedIndex.value = null
    dragOverIndex.value = null
  }

  const openAddModal = () => {
    isEditing.value = false
    editingIndex.value = null
    form.value = {
      question: '',
      answer: '',
    }
    showModal.value = true
  }

  const openEditModal = (faq: TempFaq, index: number) => {
    isEditing.value = true
    editingIndex.value = index
    form.value = {
      question: faq.question,
      answer: faq.answer,
    }
    showModal.value = true
  }

  const closeModal = () => {
    if (!submitting.value) {
      showModal.value = false
      form.value = {
        question: '',
        answer: '',
      }
      editingIndex.value = null
    }
  }

  const handleSubmit = async () => {
    // Input validation
    const questionValidation = validateRequired(form.value.question, 'Question')
    if (!questionValidation.valid) {
      showError(questionValidation.error!)
      return
    }

    const answerValidation = validateRequired(form.value.answer, 'Answer')
    if (!answerValidation.valid) {
      showError(answerValidation.error!)
      return
    }

    submitting.value = true

    try {
      if (isEditing.value && editingIndex.value !== null) {
        const faqToUpdate = faqs.value[editingIndex.value]
        if (!faqToUpdate) {
          showError('FAQ not found')
          submitting.value = false
          return
        }

        // Optimistic update
        const previousQuestion = faqToUpdate.question
        const previousAnswer = faqToUpdate.answer
        faqToUpdate.question = form.value.question.trim()
        faqToUpdate.answer = form.value.answer.trim()

        try {
          const updateResponse = await retry(
            () =>
              updateFaq(faqToUpdate.id, {
                question: faqToUpdate.question,
                answer: faqToUpdate.answer,
                order: faqToUpdate.order,
              }),
            { maxRetries: 2 }
          )

          // Validate response
          if (!updateResponse?.data) {
            throw new Error('Invalid response from server')
          }

          success('FAQ updated successfully')
        } catch (err: any) {
          // Rollback optimistic update
          faqToUpdate.question = previousQuestion
          faqToUpdate.answer = previousAnswer

          const errorMessage = getApiErrorMessage(err)
          showError(errorMessage)
        }
      } else {
        // Create new FAQ
        const newFaq: TempFaq = {
          id: Date.now().toString(),
          order: faqs.value.length + 1,
          question: form.value.question.trim(),
          answer: form.value.answer.trim(),
        }

        // Optimistic update
        faqs.value.push(newFaq)
        updateOrder()

        try {
          const createResponse = await retry(
            () =>
              createFaq({
                question: newFaq.question,
                answer: newFaq.answer,
                order: newFaq.order,
              }),
            { maxRetries: 2 }
          )

          // Validate response and update with real ID from API
          if (createResponse?.data) {
            const createdFaq = createResponse.data as any
            const index = faqs.value.findIndex(f => f.id === newFaq.id)
            if (index !== -1) {
              // Update with real data from API
              // MongoDB returns _id, convert to string
              const realId =
                createdFaq._id?.toString() ||
                createdFaq.id?.toString() ||
                createdFaq.documentId ||
                newFaq.id

              faqs.value[index] = {
                id: realId,
                order: createdFaq.order ?? newFaq.order,
                question: createdFaq.question ?? newFaq.question,
                answer: createdFaq.answer ?? newFaq.answer,
              }
              updateOrder()
            }
          }

          success('FAQ created successfully')
        } catch (err: any) {
          // Rollback optimistic update
          const index = faqs.value.findIndex(f => f.id === newFaq.id)
          if (index !== -1) {
            faqs.value.splice(index, 1)
            updateOrder()
          }

          const errorMessage = getApiErrorMessage(err)
          showError(errorMessage)
        }
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
    } finally {
      submitting.value = false
      closeModal()
    }
  }

  const confirmDelete = (index: number) => {
    deleteIndex.value = index
    showDeleteDialog.value = true
  }

  const handleDeleteConfirm = async () => {
    if (deleteIndex.value === null) return

    const index = deleteIndex.value
    const faqToDelete = faqs.value[index]

    if (!faqToDelete) {
      showError('FAQ not found')
      showDeleteDialog.value = false
      deleteIndex.value = null
      return
    }

    // Optimistic update
    const deletedFaq = faqs.value[index]
    if (!deletedFaq) {
      showError('FAQ not found')
      showDeleteDialog.value = false
      deleteIndex.value = null
      return
    }

    faqs.value.splice(index, 1)
    updateOrder()

    try {
      const deleteResponse = await retry(() => deleteFaq(faqToDelete.id), {
        maxRetries: 2,
      })

      // Validate response (delete might return empty data, which is OK)
      // Just check that request didn't fail

      success('FAQ deleted successfully')
      showDeleteDialog.value = false
      deleteIndex.value = null
    } catch (err: any) {
      // Rollback optimistic update
      faqs.value.splice(index, 0, deletedFaq)
      updateOrder()

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
      showDeleteDialog.value = false
      deleteIndex.value = null
    }
  }

  const handleDeleteCancel = () => {
    showDeleteDialog.value = false
    deleteIndex.value = null
  }

  return {
    faqs,
    loading,
    showModal,
    isEditing,
    submitting,
    editingIndex,
    showDeleteDialog,
    deleteIndex,
    isDragging,
    draggedIndex,
    dragOverIndex,
    form,
    loadFaqs,
    updateOrder,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    confirmDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
