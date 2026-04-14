<template>
  <div class="space-y-6">
    <PageHeader title="Teams" description="Manage cricket teams and countries">
      <template #actions>
        <AddButton label="Add Team" @click="openAddDialog" />
      </template>
    </PageHeader>

    <div class="bg-white shadow-lg rounded-xl p-6">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search teams..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          @input="handleSearch"
        />
      </div>

      <div v-if="isLoading" class="p-6">
        <ShimmerTable :rows="5" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="team in teams"
          :key="team.id"
          :ref="
            el => {
              if (team.id === newlyCreatedTeamId && el) {
                teamRefs[team.id] = el as HTMLElement
              }
            }
          "
          :class="[
            'border rounded-lg p-4 transition-all duration-300',
            team.id === newlyCreatedTeamId
              ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200'
              : 'border-gray-200 hover:border-blue-500',
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                v-if="team.imageUrl && !failedTeamImages.has(team.id)"
                :src="team.imageUrl"
                :alt="team.name"
                class="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                @error="handleTeamImageError(team.id)"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
              >
                <span class="text-white font-semibold text-sm">
                  {{ team.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ team.name }}</h3>
              </div>
            </div>
            <div class="flex gap-2">
              <IconButton
                variant="edit"
                title="Edit"
                @click="openEditDialog(team)"
              />
              <IconButton
                variant="delete"
                title="Delete"
                @click="handleDelete(team)"
              />
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="!isLoading && teams.length === 0"
        message="No teams found"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <TeamDialog
      :show="showDialog"
      :editing-team="editingTeam"
      @close="closeDialog"
      @saved="handleTeamSaved"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Team"
      :message="`Are you sure you want to delete &quot;${teamToDelete?.name}&quot;?`"
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import { useTeams } from '~/composables/teams/useTeams'
  import { useToast } from '~/composables/common/useToast'

  definePageMeta({
    layout: 'admin',
  })

  const { teams, isLoading, fetchTeams, deleteTeam } = useTeams()
  const searchQuery = ref('')
  const showDialog = ref(false)
  const editingTeam = ref<any>(null)
  const showDeleteDialog = ref(false)
  const teamToDelete = ref<any>(null)
  const newlyCreatedTeamId = ref<string | null>(null)
  const teamRefs = ref<Record<string, HTMLElement | null>>({})

  // Track failed team images to show fallback
  const failedTeamImages = ref<Set<string>>(new Set())

  const handleTeamImageError = (teamId: string) => {
    failedTeamImages.value.add(teamId)
  }

  let searchTimeout: NodeJS.Timeout
  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchTeams(searchQuery.value)
    }, 300)
  }

  const openAddDialog = () => {
    editingTeam.value = null
    showDialog.value = true
  }

  const openEditDialog = (team: any) => {
    editingTeam.value = team
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    editingTeam.value = null
  }

  const handleTeamSaved = async (team: {
    id: string
    name: string
    imageUrl: string
  }) => {
    searchQuery.value = ''
    await fetchTeams()
    await nextTick()

    const newTeam = teams.value.find(
      t => t.id === team.id || t.name === team.name
    )
    if (newTeam) {
      newlyCreatedTeamId.value = newTeam.id
      await nextTick()
      const teamElement = teamRefs.value[newTeam.id]
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      setTimeout(() => {
        newlyCreatedTeamId.value = null
      }, 3000)
    }
  }

  const handleDelete = (team: any) => {
    teamToDelete.value = team
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!teamToDelete.value) return

    await deleteTeam(teamToDelete.value.id)
    showDeleteDialog.value = false
    teamToDelete.value = null
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
    teamToDelete.value = null
  }

  onMounted(() => {
    fetchTeams()
  })
</script>
