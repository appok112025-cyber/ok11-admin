<template>
  <FormDialog
    :show="show"
    :title="editingTeam ? 'Edit Team' : 'Add New Team'"
    :loading="isSubmitting"
    :disabled="
      !formData.name.trim() ||
      !formData.imageUrl.trim() ||
      isSubmitting
    "
    :editing="!!editingTeam"
    max-width="max-w-lg"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Team Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter team name"
        />
        <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">
          {{ formErrors.name }}
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Team Image URL <span class="text-red-500">*</span>
        </label>
        <div class="space-y-3">
          <!-- URL input -->
          <div>
            <input
              v-model="formData.imageUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="https://example.com/team-logo.png"
            />
          </div>

          <!-- Image Preview -->
          <div v-if="formData.imageUrl" class="mt-4 flex flex-col items-center">
            <label class="block text-xs font-medium text-gray-500 mb-2 text-center">Preview (as shown in app)</label>
            <div class="flex flex-col items-center justify-center gap-2 w-full">
              <!-- Avatar circle -->
              <div
                class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-blue-100"
              >
                <img
                  v-if="!imagePreviewError"
                  :src="formData.imageUrl"
                  alt="Preview"
                  class="w-full h-full object-cover"
                  @error="imagePreviewError = true"
                  @load="imagePreviewError = false"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <svg class="w-10 h-10 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              </div>
              <!-- Name pill (like in app) -->
              <div class="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                <span class="text-xs font-black text-gray-800">
                  {{ formData.name.trim() || 'Team Name' }}
                </span>
              </div>
              <!-- Actions -->
              <div class="flex flex-col items-center gap-1">
                <span v-if="imagePreviewError" class="text-xs text-red-500">Unable to load image</span>
                <button
                  type="button"
                  @click="clearImage"
                  class="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Clear URL
                </button>
              </div>
            </div>
          </div>

          <p v-if="formErrors.imageUrl" class="text-sm text-red-600">
            {{ formErrors.imageUrl }}
          </p>
        </div>
      </div>
    </div>
  </FormDialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { validateRequired } from '~/utils/validation/validation'
  import { useToast } from '~/composables/common/useToast'

  interface Team {
    id: string
    name: string
    imageUrl?: string
  }

  interface Props {
    show: boolean
    editingTeam?: Team | null
  }

  interface Emits {
    (e: 'close'): void
    (e: 'saved', team: { id: string; name: string; imageUrl: string }): void
  }

  const props = withDefaults(defineProps<Props>(), {
    editingTeam: null,
  })

  const emit = defineEmits<Emits>()

  const { success: showSuccess, error: showError } = useToast()

  const formData = ref({ name: '', imageUrl: '' })
  const formErrors = ref({ name: '', imageUrl: '' })
  const isSubmitting = ref(false)
  const imagePreviewError = ref(false)

  const clearImage = () => {
    formData.value.imageUrl = ''
    imagePreviewError.value = false
  }

  const resetFormErrors = () => {
    formErrors.value = { name: '', imageUrl: '' }
  }

  const validateForm = () => {
    resetFormErrors()
    const nameValidation = validateRequired(formData.value.name, 'Team name')
    if (!nameValidation.valid && nameValidation.error) {
      formErrors.value.name = nameValidation.error
    }
    if (!formData.value.imageUrl.trim()) {
      formErrors.value.imageUrl = 'Team image URL is required'
      return false
    }
    return nameValidation.valid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
      const imageUrl = formData.value.imageUrl.trim()

      if (props.editingTeam) {
        const response = await $fetch<{ data: Team }>(`/api/teams/${props.editingTeam.id}`, {
          method: 'PUT',
          body: {
            id: props.editingTeam.id,
            name: formData.value.name.trim(),
            imageUrl,
          },
        })
        showSuccess('Team updated successfully')
        emit('saved', {
          id: response.data.id || props.editingTeam.id,
          name: response.data.name,
          imageUrl: response.data.imageUrl || '',
        })
      } else {
        const response = await $fetch<{ data: Team }>('/api/teams', {
          method: 'POST',
          body: {
            name: formData.value.name.trim(),
            imageUrl,
          },
        })
        showSuccess('Team created successfully')
        const teamData = response.data as any
        const teamId =
          teamData.id ||
          teamData._id ||
          teamData.data?._id ||
          teamData.data?.id ||
          ''

        if (!teamId) {
          console.error('Team created but no ID returned:', response)
          showError(
            'Team created but failed to get team ID. Please refresh and try again.'
          )
          return
        }

        emit('saved', {
          id: teamId,
          name: teamData.name,
          imageUrl: teamData.imageUrl || '',
        })
      }

      handleClose()
    } catch (error: any) {
      console.error('Submit error:', error)
      const rawError = error?.data?.error || error?.message || 'Failed to save team'
      const errorMessage = typeof rawError === 'string' ? rawError : (rawError?.message || JSON.stringify(rawError))
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('E11000')
      ) {
        showError(
          'A team with this name already exists. Please use a different name.'
        )
      } else {
        showError(errorMessage)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const handleClose = () => {
    formData.value = { name: '', imageUrl: '' }
    imagePreviewError.value = false
    resetFormErrors()
    emit('close')
  }

  watch(
    () => props.show,
    newVal => {
      if (newVal) {
        if (props.editingTeam) {
          formData.value = {
            name: props.editingTeam.name,
            imageUrl: props.editingTeam.imageUrl || '',
          }
        } else {
          formData.value = { name: '', imageUrl: '' }
        }
        imagePreviewError.value = false
        resetFormErrors()
      }
    },
    { immediate: true }
  )

  watch(
    () => formData.value.name,
    value => {
      if (value && formErrors.value.name) {
        formErrors.value.name = ''
      }
    }
  )

  watch(
    () => formData.value.imageUrl,
    value => {
      if (value && formErrors.value.imageUrl) {
        formErrors.value.imageUrl = ''
      }
    }
  )
</script>
