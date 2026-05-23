<template>
  <div class="space-y-6">
    <PageHeader title="Players" description="Manage cricket players">
      <template #actions>
        <AddButton label="Add Player" @click="openAddDialog" />
      </template>
    </PageHeader>

    <div class="bg-white shadow-lg rounded-xl p-6">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search players..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          @input="handleSearch"
        />
      </div>

      <div v-if="isLoading" class="p-6">
        <ShimmerTable :rows="5" />
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="player in players"
          :key="player.id"
          class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors flex items-center justify-between"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                v-if="player.imageUrl"
                :src="player.imageUrl"
                :alt="player.name"
                class="w-full h-full object-cover"
                @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-sm"
              >
                {{ player.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
            </div>
            <span class="font-medium text-gray-900 truncate">{{ player.name }}</span>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <IconButton
              variant="edit"
              title="Edit"
              @click="openEditDialog(player)"
            />
            <IconButton
              variant="delete"
              title="Delete"
              @click="handleDelete(player)"
            />
          </div>
        </div>
      </div>

      <EmptyState
        v-if="!isLoading && players.length === 0"
        message="No players found"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <FormDialog
      :show="showDialog"
      :title="editingPlayer ? 'Edit Player' : 'Add New Player'"
      :loading="isSubmitting"
      :disabled="!playerName.trim() || isUploading"
      :editing="!!editingPlayer"
      @close="closeDialog"
      @submit="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Player Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="playerName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter player name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Player Role <span class="text-red-500">*</span>
          </label>
          <select
            v-model="playerRole"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="bat">Batter</option>
            <option value="bowl">Bowler</option>
            <option value="wk">Wicket Keeper</option>
            <option value="ar">All-Rounder</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Player Image (Recommended: 1:1 ratio)
          </label>
          <input
            type="file"
            accept="image/*"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleImageUpload"
          />
          <div v-if="isUploading" class="mt-2 text-sm text-blue-600 font-medium">
            Uploading image...
          </div>
          
          <div class="mt-4">
            <label class="block text-xs font-medium text-gray-500 mb-1">Or provide Image URL directly</label>
            <input
              v-model="playerImageUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="https://example.com/player.jpg"
            />
          </div>

          <!-- Image Preview -->
          <div v-if="playerImageUrl" class="mt-3 flex items-center gap-3">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                :src="playerImageUrl"
                alt="Preview"
                class="w-full h-full object-cover"
                @error="imagePreviewError = true"
                @load="imagePreviewError = false"
              />
            </div>
            <span v-if="imagePreviewError" class="text-sm text-red-500">
              Unable to load image
            </span>
            <span v-else class="text-sm text-green-600">
              ✓ Image preview
            </span>
          </div>
        </div>
      </div>
    </FormDialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Player"
      :message="`Are you sure you want to delete &quot;${playerToDelete?.name}&quot;?`"
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
  const players = ref<any[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isUploading = ref(false)
  const searchQuery = ref('')
  const showDialog = ref(false)
  const playerName = ref('')
  const playerImageUrl = ref('')
  const playerRole = ref('bat')
  const imagePreviewError = ref(false)
  const editingPlayer = ref<any>(null)
  const showDeleteDialog = ref(false)
  const playerToDelete = ref<any>(null)

  const fetchPlayers = async (search?: string) => {
    isLoading.value = true
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await $fetch<{ data: any[] }>(`/api/players${query}`)
      players.value = (response.data || []).map((player: any) => ({
        ...player,
        id: player._id || player.id,
        imageUrl: player.imageUrl || '',
        role: player.role || 'bat',
      }))
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch players'
      showError(errorMessage)
      console.error('Failed to fetch players:', err)
    } finally {
      isLoading.value = false
    }
  }

  let searchTimeout: NodeJS.Timeout
  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchPlayers(searchQuery.value)
    }, 300)
  }

  const openAddDialog = () => {
    editingPlayer.value = null
    playerName.value = ''
    playerImageUrl.value = ''
    playerRole.value = 'bat'
    imagePreviewError.value = false
    isUploading.value = false
    showDialog.value = true
  }

  const openEditDialog = (player: any) => {
    editingPlayer.value = player
    playerName.value = player.name
    playerImageUrl.value = player.imageUrl || ''
    playerRole.value = player.role || 'bat'
    imagePreviewError.value = false
    isUploading.value = false
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingPlayer.value = null
    playerName.value = ''
    playerImageUrl.value = ''
    playerRole.value = 'bat'
    imagePreviewError.value = false
    isUploading.value = false
  }

  const handleImageUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    isUploading.value = true
    try {
      // 1. Get presigned URL
      const response = await $fetch<{ data: { uploadUrl: string; cdnUrl: string } }>('/api/players/image-upload-url', {
        method: 'POST',
        body: {
          contentType: file.type,
          fileName: file.name,
          fileSize: file.size,
          path: 'players'
        }
      })

      const { uploadUrl, cdnUrl } = response.data

      // 2. Upload file directly to R2
      await $fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      })

      // 3. Set the image URL to the final CDN URL
      playerImageUrl.value = cdnUrl
      success('Image uploaded successfully')
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      showError('Failed to upload image. Please try again or provide a URL directly.')
    } finally {
      isUploading.value = false
      // Reset file input
      ;(event.target as HTMLInputElement).value = ''
    }
  }

  const handleSubmit = async () => {
    if (!playerName.value.trim() || isUploading.value) return

    isSubmitting.value = true
    try {
      const body: any = { 
        name: playerName.value.trim(),
        role: playerRole.value
      }
      if (playerImageUrl.value.trim()) {
        body.imageUrl = playerImageUrl.value.trim()
      }

      if (editingPlayer.value) {
        await $fetch(`/api/players/${editingPlayer.value.id}`, {
          method: 'PUT',
          body,
        })
        success('Player updated successfully')
      } else {
        await $fetch('/api/players', {
          method: 'POST',
          body,
        })
        success('Player created successfully')
      }
      await fetchPlayers()
      closeDialog()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save player'
      showError(errorMessage)
      console.error('Failed to save player:', err)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = (player: any) => {
    playerToDelete.value = player
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!playerToDelete.value) return

    try {
      await $fetch(`/api/players/${playerToDelete.value.id}`, {
        method: 'DELETE',
      })
      success('Player deleted successfully')
      await fetchPlayers()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete player'
      showError(errorMessage)
      console.error('Failed to delete player:', err)
    } finally {
      showDeleteDialog.value = false
      playerToDelete.value = null
    }
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
    playerToDelete.value = null
  }

  onMounted(() => {
    fetchPlayers()
  })
</script>
