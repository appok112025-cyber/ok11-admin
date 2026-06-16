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
      :disabled="!playerName.trim() || isSubmitting"
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
            Player Image URL
          </label>
          <input
            v-model="playerImageUrl"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="https://example.com/player.jpg"
          />

          <!-- Image Preview — matches app squad view style -->
          <div v-if="playerImageUrl" class="mt-4 flex flex-col items-center">
            <label class="block text-xs font-medium text-gray-500 mb-2 text-center">Preview (as shown in app)</label>
            <div class="flex flex-col items-center justify-center gap-2 w-full">
              <!-- Avatar circle -->
              <div
                class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-blue-100"
              >
                <img
                  v-if="!imagePreviewError"
                  :src="playerImageUrl"
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
                  {{ playerName.trim() || 'Player Name' }}
                </span>
              </div>
              <!-- Error message -->
              <span v-if="imagePreviewError" class="text-xs text-red-500">Unable to load image</span>
            </div>
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
    showDialog.value = true
  }

  const openEditDialog = (player: any) => {
    editingPlayer.value = player
    playerName.value = player.name
    playerImageUrl.value = player.imageUrl || ''
    playerRole.value = player.role || 'bat'
    imagePreviewError.value = false
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingPlayer.value = null
    playerName.value = ''
    playerImageUrl.value = ''
    playerRole.value = 'bat'
    imagePreviewError.value = false
  }

  const handleSubmit = async () => {
    if (!playerName.value.trim()) return

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
