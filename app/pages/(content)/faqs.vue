<template>
  <div class="space-y-6">
    <PageHeader
      title="FAQs"
      description="Manage and reorder frequently asked questions"
    >
      <template #actions>
        <button
          type="button"
          @click="openAddModal"
          :disabled="loading"
          aria-label="Add new FAQ"
          class="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 disabled:hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add FAQ
        </button>
      </template>
    </PageHeader>

    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6"
      >
        <div class="flex items-start space-x-4">
          <Shimmer :width="'w-12'" :height="'h-12'" :className="'rounded-lg'" />
          <div class="flex-1 space-y-3">
            <Shimmer :width="'w-3/4'" :height="'h-5'" />
            <Shimmer :width="'w-full'" :height="'h-4'" />
            <Shimmer :width="'w-5/6'" :height="'h-4'" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="faqs.length === 0"
      class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200"
    >
      <svg
        class="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No FAQs yet</h3>
      <p class="mt-2 text-sm text-gray-500">
        Get started by creating your first FAQ.
      </p>
      <button
        type="button"
        @click="openAddModal"
        aria-label="Add new FAQ"
        class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add FAQ
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="faq.id"
        :draggable="true"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver($event)"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
        :class="[
          'bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-move',
          isDragging && draggedIndex === index
            ? 'border-blue-500 shadow-lg scale-105 opacity-50'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
        ]"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 flex-1">
              <div class="flex-shrink-0 mt-1">
                <div class="flex flex-col items-center space-y-2">
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                  <span
                    class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded"
                  >
                    {{ faq.order }}
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ faq.question }}
                </h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ faq.answer }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <button
                type="button"
                @click.stop="openEditModal(faq, index)"
                :aria-label="`Edit FAQ: ${faq.question}`"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click.stop="confirmDelete(index)"
                :aria-label="`Delete FAQ: ${faq.question}`"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[100] overflow-y-auto"
        @click.self="closeModal"
      >
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="closeModal"
        ></div>
        <div
          class="relative flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 pointer-events-none"
        >
          <div
            class="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full pointer-events-auto"
          >
            <form @submit.prevent="handleSubmit">
              <div class="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-2xl font-bold text-gray-900">
                    {{ isEditing ? 'Edit FAQ' : 'Add New FAQ' }}
                  </h3>
                  <button
                    type="button"
                    @click="closeModal"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div class="space-y-5">
                  <div>
                    <label
                      for="question"
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Question <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="question"
                      v-model="form.question"
                      type="text"
                      required
                      class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter the question"
                    />
                  </div>
                  <div>
                    <label
                      for="answer"
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Answer <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="answer"
                      v-model="form.answer"
                      rows="6"
                      required
                      class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y transition-colors"
                      placeholder="Enter the answer"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div
                class="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse sm:gap-3"
              >
                <button
                  type="submit"
                  :disabled="submitting"
                  class="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-base font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg
                    v-if="submitting"
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {{
                    submitting
                      ? 'Saving...'
                      : isEditing
                        ? 'Update FAQ'
                        : 'Create FAQ'
                  }}
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="submitting"
                  class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete FAQ"
      message="Are you sure you want to delete this FAQ? This action cannot be undone."
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import type { TempFaq } from '~/types/faq'

  definePageMeta({
    layout: 'admin',
  })

  const {
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
  } = useFaqs()

  onMounted(() => {
    loadFaqs()
  })
</script>
