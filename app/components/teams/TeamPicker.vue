<template>
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Teams <span class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div
        class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start"
      >
        <!-- Team 1 -->
        <div class="relative">
          <button
            type="button"
            @click="toggleDropdown('team1')"
            class="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all bg-white text-left flex items-center justify-between hover:border-blue-400"
            :class="selectedTeam1 ? 'border-blue-500' : 'border-gray-300'"
          >
            <span v-if="selectedTeam1" class="flex items-center gap-3">
              <img
                v-if="selectedTeam1.imageUrl"
                :src="selectedTeam1.imageUrl"
                :alt="selectedTeam1.name"
                class="w-8 h-8 object-cover rounded-full border border-gray-200"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-400 text-xs">No Image</span>
              </div>
              <span class="text-gray-900 font-medium">{{
                selectedTeam1.name
              }}</span>
            </span>
            <span v-else class="text-gray-400">Select Team 1</span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showDropdown === 'team1' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Teleport to="body">
            <div
              v-if="showDropdown === 'team1'"
              ref="dropdown1"
              class="fixed z-[60] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
              :style="dropdown1Style"
            >
              <div class="p-3 border-b border-gray-200 bg-gray-50">
                <input
                  ref="searchInput1"
                  v-model="searchTeam1"
                  type="text"
                  placeholder="Search teams..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @click.stop
                />
              </div>
              <div class="overflow-y-auto max-h-64">
                <button
                  v-for="team in filteredTeam1Countries"
                  :key="team.id"
                  type="button"
                  @click="selectTeam('team1', team)"
                  class="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                  :class="{
                    'bg-blue-100': selectedTeam1?.id === team.id,
                  }"
                >
                  <img
                    v-if="team.imageUrl"
                    :src="team.imageUrl"
                    :alt="team.name"
                    class="w-8 h-8 object-cover rounded-full border border-gray-200"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <span class="text-gray-400 text-xs">No Image</span>
                  </div>
                  <span class="text-gray-900 font-medium">{{ team.name }}</span>
                </button>
                <div v-if="filteredTeam1Countries.length === 0" class="p-4">
                  <div class="text-center text-gray-500 text-sm mb-3">
                    No teams found
                  </div>
                  <button
                    type="button"
                    @click="openAddTeamDialog('team1')"
                    class="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add "{{ searchTeam1 }}" as new team
                  </button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <!-- VS Badge -->
        <div class="flex items-center justify-center pt-2">
          <div
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-4 py-2 rounded-full shadow-md text-sm"
          >
            VS
          </div>
        </div>

        <!-- Team 2 -->
        <div class="relative">
          <button
            type="button"
            @click="toggleDropdown('team2')"
            class="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all bg-white text-left flex items-center justify-between hover:border-blue-400"
            :class="selectedTeam2 ? 'border-blue-500' : 'border-gray-300'"
          >
            <span v-if="selectedTeam2" class="flex items-center gap-3">
              <img
                v-if="selectedTeam2.imageUrl"
                :src="selectedTeam2.imageUrl"
                :alt="selectedTeam2.name"
                class="w-8 h-8 object-cover rounded-full border border-gray-200"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-400 text-xs">No Image</span>
              </div>
              <span class="text-gray-900 font-medium">{{
                selectedTeam2.name
              }}</span>
            </span>
            <span v-else class="text-gray-400">Select Team 2</span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showDropdown === 'team2' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Teleport to="body">
            <div
              v-if="showDropdown === 'team2'"
              ref="dropdown2"
              class="fixed z-[60] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
              :style="dropdown2Style"
            >
              <div class="p-3 border-b border-gray-200 bg-gray-50">
                <input
                  ref="searchInput2"
                  v-model="searchTeam2"
                  type="text"
                  placeholder="Search teams..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @click.stop
                />
              </div>
              <div class="overflow-y-auto max-h-64">
                <button
                  v-for="team in filteredTeam2Countries"
                  :key="team.id"
                  type="button"
                  @click="selectTeam('team2', team)"
                  class="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                  :class="{
                    'bg-blue-100': selectedTeam2?.id === team.id,
                  }"
                >
                  <img
                    v-if="team.imageUrl"
                    :src="team.imageUrl"
                    :alt="team.name"
                    class="w-8 h-8 object-cover rounded-full border border-gray-200"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <span class="text-gray-400 text-xs">No Image</span>
                  </div>
                  <span class="text-gray-900 font-medium">{{ team.name }}</span>
                </button>
                <div v-if="filteredTeam2Countries.length === 0" class="p-4">
                  <div class="text-center text-gray-500 text-sm mb-3">
                    No teams found
                  </div>
                  <button
                    type="button"
                    @click="openAddTeamDialog('team2')"
                    class="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add "{{ searchTeam2 }}" as new team
                  </button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>

    <!-- Add Team Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddTeamDialog"
          class="fixed inset-0 z-[100] overflow-y-auto"
          @click.self="closeAddTeamDialog"
        >
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            @click="closeAddTeamDialog"
          ></div>
          <div
            class="relative flex items-center justify-center min-h-screen px-4 py-4 pointer-events-none"
          >
            <div
              class="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-lg pointer-events-auto"
            >
              <div class="bg-white px-6 pt-6 pb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Add New Team
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Team Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="newTeamName"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Team Image <span class="text-red-500">*</span>
                    </label>
                    <div class="space-y-3">
                      <div
                        v-if="newTeamImageUrl"
                        class="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <img
                          :src="newTeamImageUrl"
                          alt="Team preview"
                          class="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          @click="newTeamImageUrl = ''"
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
                          @change="handleFileSelect"
                        />
                        <button
                          type="button"
                          @click="fileInput?.click()"
                          class="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium"
                          :disabled="isUploading"
                        >
                          <span v-if="!isUploading">Upload Image</span>
                          <span v-else>Uploading...</span>
                        </button>
                        <p class="mt-2 text-xs text-gray-500">
                          PNG, JPG, GIF up to 1MB
                        </p>
                      </div>
                      <div v-if="uploadError" class="text-sm text-red-600">
                        {{ uploadError }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                <button
                  type="button"
                  @click="addNewTeam"
                  :disabled="
                    !newTeamName.trim() || !newTeamImageUrl || isUploading
                  "
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Team
                </button>
                <button
                  type="button"
                  @click="closeAddTeamDialog"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    computed,
    watch,
    onMounted,
    onBeforeUnmount,
    nextTick,
  } from 'vue'
  import { useTeams } from '~/composables/teams/useTeams'

  interface Team {
    id: string
    name: string
    imageUrl: string
  }

  const props = defineProps<{
    modelValue: string
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  // Teams from API
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const uploadImage = async (
    file: File,
    path: string = 'teams'
  ): Promise<string | null> => {
    isUploading.value = true
    uploadError.value = null
    try {
      const contentType = file.type || 'application/octet-stream'

      // Optimistic local preview
      try {
        newTeamImageUrl.value = URL.createObjectURL(file)
      } catch (e) {
        // ignore preview failures
      }

      const presignResponse = await $fetch<{
        data: { uploadUrl: string; fileUrl: string }
      }>('/api/teams/image-upload-url', {
        method: 'POST',
        body: {
          contentType,
          path,
        },
      })

      const presignData = presignResponse.data || (presignResponse as any)
      const uploadUrl = presignData.uploadUrl
      const fileUrl = presignData.fileUrl

      if (!uploadUrl || !fileUrl) {
        throw new Error('Failed to get upload URL')
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error(`Image upload failed with status ${uploadRes.status}`)
      }

      newTeamImageUrl.value = fileUrl
      return fileUrl
    } catch (error: any) {
      console.error('TeamPicker image upload error:', error)
      uploadError.value =
        (error && (error as any).statusMessage) ||
        (error && (error as any).message) ||
        'Image upload failed. Please try again.'
      return null
    } finally {
      isUploading.value = false
    }
  }

  // Use teams composable
  const {
    teams: allTeamsFromAPI,
    isLoading: isLoadingTeams,
    fetchTeams,
  } = useTeams()

  const selectedTeam1 = ref<Team | null>(null)
  const selectedTeam2 = ref<Team | null>(null)
  const showDropdown = ref<'team1' | 'team2' | null>(null)
  const searchTeam1 = ref('')
  const searchTeam2 = ref('')
  const searchInput1 = ref<HTMLInputElement | null>(null)
  const searchInput2 = ref<HTMLInputElement | null>(null)
  const dropdown1 = ref<HTMLElement | null>(null)
  const dropdown2 = ref<HTMLElement | null>(null)
  const dropdown1Style = ref({})
  const dropdown2Style = ref({})

  // Add team dialog state
  const showAddTeamDialog = ref(false)
  const addingForTeam = ref<'team1' | 'team2' | null>(null)
  const newTeamName = ref('')
  const newTeamImageUrl = ref('')
  const fileInput = ref<HTMLInputElement | null>(null)

  // All teams (from API)
  const allTeams = computed(() => allTeamsFromAPI.value)

  const filteredTeam1Countries = computed(() => {
    const search = searchTeam1.value.toLowerCase()
    return allTeams.value.filter(
      team =>
        team.name.toLowerCase().includes(search) &&
        team.id !== selectedTeam2.value?.id
    )
  })

  const filteredTeam2Countries = computed(() => {
    const search = searchTeam2.value.toLowerCase()
    return allTeams.value.filter(
      team =>
        team.name.toLowerCase().includes(search) &&
        team.id !== selectedTeam1.value?.id
    )
  })

  const updateDropdownPosition = (team: 'team1' | 'team2') => {
    const button = document.querySelector(
      team === 'team1'
        ? '.grid > div:first-child > button'
        : '.grid > div:last-child > button'
    ) as HTMLElement

    if (!button) return

    const rect = button.getBoundingClientRect()
    const style = {
      top: `${rect.bottom + window.scrollY + 8}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
    }

    if (team === 'team1') {
      dropdown1Style.value = style
    } else {
      dropdown2Style.value = style
    }
  }

  const toggleDropdown = async (team: 'team1' | 'team2') => {
    if (showDropdown.value === team) {
      showDropdown.value = null
    } else {
      showDropdown.value = team
      await nextTick()
      updateDropdownPosition(team)
      if (team === 'team1' && searchInput1.value) {
        searchInput1.value.focus()
      } else if (team === 'team2' && searchInput2.value) {
        searchInput2.value.focus()
      }
    }
  }

  const selectTeam = (team: 'team1' | 'team2', selected: Team) => {
    if (team === 'team1') {
      selectedTeam1.value = selected
      searchTeam1.value = ''
    } else {
      selectedTeam2.value = selected
      searchTeam2.value = ''
    }
    showDropdown.value = null
    updateValue()
  }

  const updateValue = () => {
    if (selectedTeam1.value && selectedTeam2.value) {
      emit(
        'update:modelValue',
        `${selectedTeam1.value.name} vs ${selectedTeam2.value.name}`
      )
    } else if (selectedTeam1.value) {
      emit('update:modelValue', selectedTeam1.value.name)
    } else if (selectedTeam2.value) {
      emit('update:modelValue', selectedTeam2.value.name)
    } else {
      emit('update:modelValue', '')
    }
  }

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const imageUrl = await uploadImage(file, 'teams')
    if (imageUrl) {
      newTeamImageUrl.value = imageUrl
    }
  }

  const openAddTeamDialog = (team: 'team1' | 'team2') => {
    addingForTeam.value = team
    newTeamName.value = team === 'team1' ? searchTeam1.value : searchTeam2.value
    newTeamImageUrl.value = ''
    showAddTeamDialog.value = true
    showDropdown.value = null
  }

  const closeAddTeamDialog = () => {
    showAddTeamDialog.value = false
    addingForTeam.value = null
    newTeamName.value = ''
    newTeamImageUrl.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  const addNewTeam = async () => {
    if (!newTeamName.value.trim() || !newTeamImageUrl.value) return

    try {
      const response = await $fetch<{
        data: Team
      }>('/api/teams', {
        method: 'POST',
        body: {
          name: newTeamName.value.trim(),
          imageUrl: newTeamImageUrl.value,
        },
      })

      if (response.data) {
        await fetchTeams()

        const newTeam = allTeamsFromAPI.value.find(
          t => t.name === newTeamName.value.trim()
        )

        if (newTeam) {
          if (addingForTeam.value === 'team1') {
            selectedTeam1.value = newTeam
            searchTeam1.value = ''
          } else if (addingForTeam.value === 'team2') {
            selectedTeam2.value = newTeam
            searchTeam2.value = ''
          }

          updateValue()
        }

        closeAddTeamDialog()
      }
    } catch (error) {
      console.error('Failed to add team:', error)
    }
  }

  const parseTeamValue = (value: string) => {
    if (!value) return

    const parts = value.split(' vs ')
    if (parts.length === 2) {
      const part1 = parts[0]
      const part2 = parts[1]
      if (part1 && part2) {
        const team1 = allTeams.value.find(c => c.name === part1.trim())
        const team2 = allTeams.value.find(c => c.name === part2.trim())
        if (team1) selectedTeam1.value = team1
        if (team2) selectedTeam2.value = team2
      }
    } else if (parts.length === 1) {
      const part = parts[0]
      if (part) {
        const team = allTeams.value.find(c => c.name === part.trim())
        if (team) selectedTeam1.value = team
      }
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    // Close team dropdowns
    if (!target.closest('.relative')) {
      showDropdown.value = null
    }
  }

  watch(
    () => props.modelValue,
    newValue => {
      if (newValue && !selectedTeam1.value && !selectedTeam2.value) {
        parseTeamValue(newValue)
      }
    },
    { immediate: true }
  )

  onMounted(async () => {
    // Fetch teams from API
    await fetchTeams()

    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', () => {
      if (showDropdown.value) {
        updateDropdownPosition(showDropdown.value)
      }
    })
    window.addEventListener('resize', () => {
      if (showDropdown.value) {
        updateDropdownPosition(showDropdown.value)
      }
    })
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
</style>
