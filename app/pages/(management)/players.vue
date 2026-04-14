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
          <span class="font-medium text-gray-900">{{ player.name }}</span>
          <div class="flex gap-2">
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

    <!-- Add Dialog -->
    <FormDialog
      :show="showDialog"
      :title="editingPlayer ? 'Edit Player' : 'Add New Player'"
      :loading="isSubmitting"
      :disabled="!playerName.trim()"
      :editing="!!editingPlayer"
      @close="closeDialog"
      @submit="handleSubmit"
    >
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
    showDialog.value = true
  }

  const openEditDialog = (player: any) => {
    editingPlayer.value = player
    playerName.value = player.name
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingPlayer.value = null
    playerName.value = ''
  }

  const handleSubmit = async () => {
    if (!playerName.value.trim()) return

    isSubmitting.value = true
    try {
      if (editingPlayer.value) {
        await $fetch(`/api/players/${editingPlayer.value.id}`, {
          method: 'PUT',
          body: { name: playerName.value.trim() },
        })
        success('Player updated successfully')
      } else {
        await $fetch('/api/players', {
          method: 'POST',
          body: { name: playerName.value.trim() },
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
