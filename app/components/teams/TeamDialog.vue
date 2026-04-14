<template>
  <FormDialog
    :show="show"
    :title="editingTeam ? 'Edit Team' : 'Add New Team'"
    :loading="isSubmitting"
    :disabled="
      !formData.name.trim() ||
      (!selectedFile && !formData.imageUrl) ||
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
          Team Image <span class="text-red-500">*</span>
        </label>
        <div class="space-y-3">
          <div
            v-if="formData.imageUrl || localImagePreview"
            class="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200"
          >
            <img
              :src="localImagePreview || formData.imageUrl"
              alt="Team preview"
              class="w-full h-full object-cover"
            />
            <button
              type="button"
              @click="clearImage"
              class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            v-else
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="!formData.name.trim() || isSubmitting"
              @change="handleFileSelect"
            />
            <button
              type="button"
              @click="fileInput?.click()"
              class="w-full py-3 px-4 rounded-lg transition-colors font-medium"
              :class="
                !formData.name.trim() || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              "
              :disabled="!formData.name.trim() || isSubmitting"
            >
              {{
                formData.name.trim() ? 'Select Image' : 'Enter team name first'
              }}
            </button>
            <p class="mt-2 text-xs text-gray-500">
              {{
                formData.name.trim()
                  ? 'PNG, JPG, GIF up to 5MB'
                  : 'Enter team name to enable image selection'
              }}
            </p>
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
  import { sanitizeFileName, getFileExtension } from '~/utils/file/file'
  import { getUploadErrorMessage } from '~/utils/file/upload'

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
  const selectedFile = ref<File | null>(null)
  const localImagePreview = ref('')
  const isSubmitting = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)

  const uploadImage = async (file: File): Promise<string> => {
    const teamName = sanitizeFileName(formData.value.name.trim())
    const fileExtension = getFileExtension(file.name)
    const fileName = `${teamName}${fileExtension}`

    try {
      const { data } = await $fetch<{
        data: { uploadUrl: string; fileUrl: string }
      }>('/api/teams/image-upload-url', {
        method: 'POST',
        body: {
          contentType: file.type || 'image/jpeg',
          fileName,
          fileSize: file.size,
        },
      })

      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        mode: 'cors',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status}`)
      }

      return data.fileUrl
    } catch (error: any) {
      const friendlyMessage = getUploadErrorMessage(error)
      showError(friendlyMessage)
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      selectedFile.value = file
      localImagePreview.value = URL.createObjectURL(file)
      formData.value.imageUrl = ''
    }
  }

  const clearImage = () => {
    formData.value.imageUrl = ''
    selectedFile.value = null
    localImagePreview.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
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
    if (!selectedFile.value && !formData.value.imageUrl) {
      formErrors.value.imageUrl = 'Team image is required'
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
      let imageUrl = formData.value.imageUrl

      if (selectedFile.value && !props.editingTeam) {
        imageUrl = await uploadImage(selectedFile.value)
      }

      if (props.editingTeam) {
        const response = await $fetch<{ data: Team }>('/api/teams', {
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
      const errorMessage =
        error?.data?.error || error?.message || 'Failed to save team'
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
    selectedFile.value = null
    localImagePreview.value = ''
    resetFormErrors()
    if (fileInput.value) {
      fileInput.value.value = ''
    }
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
        selectedFile.value = null
        localImagePreview.value = ''
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
