<template>
  <div class="space-y-6">
    <PageHeader
      title="Notifications"
      description="Manage and send push notifications to users"
    >
      <template #actions>
        <AddButton label="Add Notification" @click="openAddDialog" />
      </template>
    </PageHeader>

    <div class="bg-white shadow-lg rounded-xl p-6">
      <div v-if="isLoading" class="p-6">
        <ShimmerTable :rows="5" />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all"
        >
          <div class="flex items-start gap-4">
            <div
              v-if="
                notification.image &&
                !failedNotificationImages.has(notification.id)
              "
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                :src="notification.image"
                :alt="notification.title"
                class="w-full h-full object-cover"
                @error="handleNotificationImageError(notification.id)"
              />
            </div>
            <div
              v-else-if="notification.image"
              class="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
            >
              <svg
                class="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 mb-1">
                {{ notification.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                {{ notification.body }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  @click="handleSend(notification)"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send
                </button>
                <IconButton
                  variant="edit"
                  title="Edit"
                  @click="openEditDialog(notification)"
                />
                <IconButton
                  variant="delete"
                  title="Delete"
                  @click="handleDelete(notification)"
                />
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-if="notifications.length === 0"
          message="No notifications found"
        />
      </div>
    </div>

    <FormDialog
      :show="showDialog"
      :title="
        editingNotification ? 'Edit Notification' : 'Add New Notification'
      "
      :loading="isSubmitting"
      :disabled="!formData.title.trim() || !formData.body.trim()"
      :editing="!!editingNotification"
      max-width="max-w-2xl"
      @close="closeDialog"
      @submit="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification title"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Body <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.body"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification body"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            v-model="formData.image"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <p class="mt-1 text-xs text-gray-500">
            Enter a URL for the notification image
          </p>
        </div>
        <div v-if="formData.image" class="mt-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div class="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <img
              :src="formData.image"
              alt="Preview"
              class="w-full h-full object-cover"
              @error="formData.image = ''"
            />
          </div>
        </div>
      </div>
    </FormDialog>

    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Notification"
      :message="`Are you sure you want to delete &quot;${notificationToDelete?.title}&quot;?`"
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { useNotifications } from '~/composables/common/useNotifications'

  definePageMeta({
    layout: 'admin',
  })

  const {
    notifications,
    isLoading,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
  } = useNotifications()

  const showDialog = ref(false)
  const showDeleteDialog = ref(false)
  const isSubmitting = ref(false)
  const editingNotification = ref<any>(null)
  const notificationToDelete = ref<any>(null)

  // Track failed notification images to show fallback
  const failedNotificationImages = ref<Set<string>>(new Set())

  const handleNotificationImageError = (notificationId: string) => {
    failedNotificationImages.value.add(notificationId)
  }

  const formData = ref({
    title: '',
    body: '',
    image: '',
  })

  const openAddDialog = () => {
    editingNotification.value = null
    formData.value = {
      title: '',
      body: '',
      image: '',
    }
    showDialog.value = true
  }

  const openEditDialog = (notification: any) => {
    editingNotification.value = notification
    formData.value = {
      title: notification.title || '',
      body: notification.body || '',
      image: notification.image || '',
    }
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingNotification.value = null
    formData.value = {
      title: '',
      body: '',
      image: '',
    }
  }

  const handleSubmit = async () => {
    if (!formData.value.title.trim() || !formData.value.body.trim()) {
      return
    }

    isSubmitting.value = true
    try {
      if (editingNotification.value) {
        await updateNotification(editingNotification.value.id, {
          title: formData.value.title.trim(),
          body: formData.value.body.trim(),
          image: formData.value.image.trim() || undefined,
        })
      } else {
        await createNotification({
          title: formData.value.title.trim(),
          body: formData.value.body.trim(),
          image: formData.value.image.trim() || undefined,
        })
      }
      closeDialog()
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = (notification: any) => {
    notificationToDelete.value = notification
    showDeleteDialog.value = true
  }

  const handleDeleteConfirm = async () => {
    if (notificationToDelete.value) {
      await deleteNotification(notificationToDelete.value.id)
      showDeleteDialog.value = false
      notificationToDelete.value = null
    }
  }

  const handleDeleteCancel = () => {
    showDeleteDialog.value = false
    notificationToDelete.value = null
  }

  const handleSend = async (notification: any) => {
    await sendNotification(notification.id)
  }

  onMounted(() => {
    fetchNotifications()
  })
</script>
