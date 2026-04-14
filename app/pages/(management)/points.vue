<template>
  <div class="space-y-6">
    <PageHeader
      title="Points System"
      description="Manage skill based point system content"
    >
      <template #actions>
        <SubmitButton
          :loading="isLoading"
          :disabled="!hasChanges"
          loading-text="Saving..."
          add-text="Save Changes"
          use-gradient
          @click="handleSubmit"
        />
      </template>
    </PageHeader>

    <div
      v-if="loading"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6 space-y-6"
    >
      <Shimmer :width="'w-full'" :height="'h-32'" :className="'rounded-lg'" />
      <div class="space-y-4">
        <Shimmer :width="'w-32'" :height="'h-4'" />
        <div class="space-y-3">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label
            for="points"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Points System Content
          </label>
          <RichTextEditor
            v-model="formData.content"
            placeholder="Enter points system content..."
            :disabled="isLoading"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-4">
            Point Items
          </label>
          <div class="space-y-4">
            <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="p-5 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div class="flex items-center justify-between mb-4">
                <span
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Point {{ index + 1 }}
                </span>
                <button
                  type="button"
                  @click="removeItem(index)"
                  :aria-label="`Remove point ${index + 1}`"
                  class="text-red-600 hover:text-red-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Remove
                </button>
              </div>
              <input
                v-model="item.title"
                type="text"
                class="block w-full px-4 py-3 mb-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Title (e.g., Simple Scoring)"
              />
              <textarea
                v-model="item.description"
                rows="3"
                class="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y transition-colors"
                placeholder="Description"
              ></textarea>
            </div>
            <button
              type="button"
              @click="addItem"
              aria-label="Add new point item"
              class="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add Point Item
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import RichTextEditor from '~/components/forms/RichTextEditor.vue'
  import type { PointsData } from '~/types/site-content'
  import { useSiteContentForm } from '~/composables/content/useSiteContentForm'

  definePageMeta({
    layout: 'admin',
  })

  const { formData, isLoading, loading, hasChanges, loadData, saveData } =
    useSiteContentForm<PointsData>('points')

  const addItem = () => {
    formData.value.items.push({
      title: '',
      description: '',
    })
  }

  const removeItem = (index: number) => {
    formData.value.items.splice(index, 1)
  }

  const handleSubmit = async () => {
    await saveData()
  }

  onMounted(() => {
    loadData()
  })
</script>
