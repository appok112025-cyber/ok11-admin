<template>
  <div class="space-y-6">
    <PageHeader
      title="Quiz Templates"
      description="Manage quiz questions for matches"
    >
      <template #actions>
        <AddButton label="Add Quiz" @click="openAddDialog" />
      </template>
    </PageHeader>

    <div class="bg-white shadow-lg rounded-xl p-6">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search quizzes..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          @input="handleSearch"
        />
      </div>

      <div v-if="isLoading" class="p-6">
        <ShimmerTable :rows="5" />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="quiz in quizzes"
          :key="quiz.id"
          class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ quiz.question }}</h3>
            </div>
            <div class="flex gap-2 ml-4">
              <IconButton
                variant="edit"
                title="Edit"
                @click="openEditDialog(quiz)"
              />
              <IconButton
                variant="delete"
                title="Delete"
                @click="handleDelete(quiz)"
              />
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="!isLoading && quizzes.length === 0"
        message="No quizzes found"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <FormDialog
      :show="showDialog"
      :title="editingQuiz ? 'Edit Quiz' : 'Add New Quiz'"
      :loading="isSubmitting"
      :disabled="!isFormValid"
      :editing="!!editingQuiz"
      max-width="max-w-2xl"
      @close="closeDialog"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Question <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="formData.question"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter quiz question"
        ></textarea>
      </div>
    </FormDialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Quiz"
      message="Are you sure you want to delete this quiz?"
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { useToast } from '~/composables/common/useToast'

  definePageMeta({
    layout: 'admin',
  })

  const { success, error: showError } = useToast()
  const quizzes = ref<any[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const searchQuery = ref('')
  const showDialog = ref(false)
  const editingQuiz = ref<any>(null)
  const formData = ref({
    question: '',
  })
  const showDeleteDialog = ref(false)
  const quizToDelete = ref<any>(null)

  const isFormValid = computed(() => {
    return formData.value.question.trim() !== ''
  })

  const fetchQuizzes = async (search?: string) => {
    isLoading.value = true
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await $fetch<{ data: any[] }>(`/api/quizzes${query}`)
      quizzes.value = (response.data || []).map((quiz: any) => ({
        ...quiz,
        id: quiz._id || quiz.id,
      }))
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch quizzes'
      showError(errorMessage)
      console.error('Failed to fetch quizzes:', err)
    } finally {
      isLoading.value = false
    }
  }

  let searchTimeout: NodeJS.Timeout
  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchQuizzes(searchQuery.value)
    }, 300)
  }

  const openAddDialog = () => {
    editingQuiz.value = null
    formData.value = {
      question: '',
    }
    showDialog.value = true
  }

  const openEditDialog = (quiz: any) => {
    editingQuiz.value = quiz
    formData.value = {
      question: quiz.question,
    }
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingQuiz.value = null
  }

  const handleSubmit = async () => {
    if (!isFormValid.value) return

    isSubmitting.value = true
    try {
      if (editingQuiz.value) {
        await $fetch(`/api/quizzes/${editingQuiz.value.id}`, {
          method: 'PUT',
          body: formData.value,
        })
        success('Quiz updated successfully')
      } else {
        await $fetch('/api/quizzes', {
          method: 'POST',
          body: formData.value,
        })
        success('Quiz created successfully')
      }

      await fetchQuizzes()
      closeDialog()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save quiz'
      showError(errorMessage)
      console.error('Failed to save quiz:', err)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = (quiz: any) => {
    quizToDelete.value = quiz
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!quizToDelete.value) return

    try {
      await $fetch(`/api/quizzes/${quizToDelete.value.id}`, {
        method: 'DELETE',
      })
      success('Quiz deleted successfully')
      await fetchQuizzes()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete quiz'
      showError(errorMessage)
      console.error('Failed to delete quiz:', err)
    } finally {
      showDeleteDialog.value = false
      quizToDelete.value = null
    }
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
    quizToDelete.value = null
  }

  onMounted(() => {
    fetchQuizzes()
  })
</script>
