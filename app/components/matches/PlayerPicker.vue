<template>
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Playing XI
    </label>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
      <!-- Team 1 Players -->
      <div class="border-2 border-gray-300 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-3">
          {{ teamNames?.team1 || 'Team 1' }} Squad
        </h3>

        <div class="relative mb-3">
          <input
            ref="inputA"
            v-model="searchTeamA"
            type="text"
            placeholder="Search or add player..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            @focus="handleFocusA"
            @input="handleInputA"
          />

          <Teleport to="body">
            <div
              v-if="showDropdownA"
              ref="dropdownA"
              class="fixed z-[60] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
              :style="dropdownAStyle"
            >
              <div class="max-h-48 overflow-y-auto">
                <button
                  type="button"
                  @click="openAddPlayerDialog('A')"
                  class="w-full px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center gap-2 border-b border-blue-200"
                >
                  <svg
                    class="w-4 h-4"
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
                  <span>Add New Player</span>
                </button>
                <button
                  v-for="player in filteredPlayersA"
                  :key="player.id"
                  type="button"
                  @click="addPlayerToTeam('A', player)"
                  class="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2"
                >
                  <div class="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      v-if="player.imageUrl"
                      :src="player.imageUrl"
                      :alt="player.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold"
                    >
                      {{ player.name?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                  </div>
                  <span>{{ player.name }}</span>
                </button>
                <div
                  v-if="filteredPlayersA.length === 0"
                  class="p-4 text-center text-gray-500 text-sm"
                >
                  No players found
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <div class="space-y-2 min-h-[100px]">
          <div
            v-for="player in selectedPlayersA"
            :key="player.id"
            class="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  v-if="player.imageUrl"
                  :src="player.imageUrl"
                  :alt="player.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold"
                >
                  {{ player.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
              </div>
              <span class="text-sm">{{ player.name }}</span>
            </div>
            <button
              type="button"
              @click="removePlayerFromTeam('A', player.id)"
              class="text-red-600 hover:text-red-800"
            >
              <svg
                class="w-4 h-4"
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
            v-if="selectedPlayersA.length === 0"
            class="text-center text-gray-400 text-sm py-8"
          >
            No players selected
          </div>
        </div>
      </div>

      <!-- VS Badge -->
      <div class="flex items-center justify-center pt-8">
        <div
          class="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-4 py-2 rounded-full shadow-md text-sm"
        >
          VS
        </div>
      </div>

      <!-- Team 2 Players -->
      <div class="border-2 border-gray-300 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-3">
          {{ teamNames?.team2 || 'Team 2' }} Squad
        </h3>

        <div class="relative mb-3">
          <input
            ref="inputB"
            v-model="searchTeamB"
            type="text"
            placeholder="Search or add player..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            @focus="handleFocusB"
            @input="handleInputB"
          />

          <Teleport to="body">
            <div
              v-if="showDropdownB"
              ref="dropdownB"
              class="fixed z-[60] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
              :style="dropdownBStyle"
            >
              <div class="max-h-48 overflow-y-auto">
                <button
                  type="button"
                  @click="openAddPlayerDialog('B')"
                  class="w-full px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center gap-2 border-b border-blue-200"
                >
                  <svg
                    class="w-4 h-4"
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
                  <span>Add New Player</span>
                </button>
                <button
                  v-for="player in filteredPlayersB"
                  :key="player.id"
                  type="button"
                  @click="addPlayerToTeam('B', player)"
                  class="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2"
                >
                  <div class="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      v-if="player.imageUrl"
                      :src="player.imageUrl"
                      :alt="player.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold"
                    >
                      {{ player.name?.charAt(0)?.toUpperCase() || '?' }}
                    </div>
                  </div>
                  <span>{{ player.name }}</span>
                </button>
                <div
                  v-if="filteredPlayersB.length === 0"
                  class="p-4 text-center text-gray-500 text-sm"
                >
                  No players found
                </div>
              </div>
            </div>
          </Teleport>
        </div>

        <div class="space-y-2 min-h-[100px]">
          <div
            v-for="player in selectedPlayersB"
            :key="player.id"
            class="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  v-if="player.imageUrl"
                  :src="player.imageUrl"
                  :alt="player.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold"
                >
                  {{ player.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
              </div>
              <span class="text-sm">{{ player.name }}</span>
            </div>
            <button
              type="button"
              @click="removePlayerFromTeam('B', player.id)"
              class="text-red-600 hover:text-red-800"
            >
              <svg
                class="w-4 h-4"
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
            v-if="selectedPlayersB.length === 0"
            class="text-center text-gray-400 text-sm py-8"
          >
            No players selected
          </div>
        </div>
      </div>
    </div>

    <!-- Add Player Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddPlayerDialog"
          class="fixed inset-0 z-[100] overflow-y-auto"
          @click.self="closeAddPlayerDialog"
        >
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm"
            @click="closeAddPlayerDialog"
          ></div>
          <div
            class="relative flex items-center justify-center min-h-screen px-4 py-4 pointer-events-none"
          >
            <div
              class="relative bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
            >
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Add New Player
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Player Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="newPlayerName"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter player name"
                      @keyup.enter="handleAddPlayer"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Player Image URL
                    </label>
                    <input
                      v-model="newPlayerImageUrl"
                      type="url"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/player.jpg"
                    />
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                <button
                  @click="handleAddPlayer"
                  :disabled="!newPlayerName.trim()"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Player
                </button>
                <button
                  @click="closeAddPlayerDialog"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
  import { useToast } from '~/composables/common/useToast'
  interface Player {
    id: string
    name: string
    imageUrl?: string
  }

  const props = defineProps<{
    modelValue: { teamA: string[]; teamB: string[] }
    teamNames?: { team1: string; team2: string }
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: { teamA: string[]; teamB: string[] }): void
  }>()

  const allPlayers = ref<Player[]>([])
  const selectedPlayersA = ref<Player[]>([])
  const selectedPlayersB = ref<Player[]>([])
  const searchTeamA = ref('')
  const searchTeamB = ref('')
  const showDropdownA = ref(false)
  const showDropdownB = ref(false)
  const inputA = ref<HTMLInputElement | null>(null)
  const inputB = ref<HTMLInputElement | null>(null)
  const dropdownA = ref<HTMLElement | null>(null)
  const dropdownB = ref<HTMLElement | null>(null)
  const dropdownAStyle = ref({})
  const dropdownBStyle = ref({})
  const showAddPlayerDialog = ref(false)
  const newPlayerName = ref('')
  const newPlayerImageUrl = ref('')
  const pendingTeam = ref<'A' | 'B' | null>(null)

  const fetchPlayers = async () => {
    try {
      const response = await $fetch<{ data: any[] }>('/api/players')
      if (response.data) {
        allPlayers.value = (response.data || []).map((player: any) => ({
          id: player._id || player.id,
          name: player.name,
          imageUrl: player.imageUrl || '',
        }))
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
    }
  }

  const filteredPlayersA = computed(() => {
    const search = searchTeamA.value.toLowerCase().trim()
    const selectedIds = selectedPlayersA.value.map(p => p.id)
    let filtered = allPlayers.value.filter(p => !selectedIds.includes(p.id))

    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search))
    } else {
      filtered = filtered.slice(0, 5)
    }

    return filtered
  })

  const filteredPlayersB = computed(() => {
    const search = searchTeamB.value.toLowerCase().trim()
    const selectedIds = selectedPlayersB.value.map(p => p.id)
    let filtered = allPlayers.value.filter(p => !selectedIds.includes(p.id))

    if (search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search))
    } else {
      filtered = filtered.slice(0, 5)
    }

    return filtered
  })

  const handleFocusA = () => {
    showDropdownA.value = true
    nextTick(() => updateDropdownPosition('A'))
  }

  const handleFocusB = () => {
    showDropdownB.value = true
    nextTick(() => updateDropdownPosition('B'))
  }

  const handleInputA = () => {
    if (!showDropdownA.value) {
      showDropdownA.value = true
    }
    nextTick(() => updateDropdownPosition('A'))
  }

  const handleInputB = () => {
    if (!showDropdownB.value) {
      showDropdownB.value = true
    }
    nextTick(() => updateDropdownPosition('B'))
  }

  const updateDropdownPosition = (team: 'A' | 'B') => {
    const input = team === 'A' ? inputA.value : inputB.value

    if (!input) return

    const rect = input.getBoundingClientRect()
    const style = {
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
    }

    if (team === 'A') {
      dropdownAStyle.value = style
    } else {
      dropdownBStyle.value = style
    }
  }

  const addPlayerToTeam = (team: 'A' | 'B', player: Player) => {
    if (team === 'A') {
      selectedPlayersA.value.push(player)
      searchTeamA.value = ''
      showDropdownA.value = false
    } else {
      selectedPlayersB.value.push(player)
      searchTeamB.value = ''
      showDropdownB.value = false
    }
    updateValue()
  }

  const removePlayerFromTeam = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      selectedPlayersA.value = selectedPlayersA.value.filter(
        p => p.id !== playerId
      )
    } else {
      selectedPlayersB.value = selectedPlayersB.value.filter(
        p => p.id !== playerId
      )
    }
    updateValue()
  }

  const openAddPlayerDialog = (team: 'A' | 'B') => {
    pendingTeam.value = team
    newPlayerName.value = ''
    newPlayerImageUrl.value = ''
    showAddPlayerDialog.value = true
    if (team === 'A') {
      showDropdownA.value = false
    } else {
      showDropdownB.value = false
    }
  }

  const closeAddPlayerDialog = () => {
    showAddPlayerDialog.value = false
    newPlayerName.value = ''
    newPlayerImageUrl.value = ''
    pendingTeam.value = null
  }

  const handleAddPlayer = async () => {
    if (!newPlayerName.value.trim() || !pendingTeam.value) return

    const { success, error: showError } = useToast()

    try {
      const body: any = { name: newPlayerName.value.trim() }
      if (newPlayerImageUrl.value.trim()) {
        body.imageUrl = newPlayerImageUrl.value.trim()
      }

      const response = await $fetch<{ data: any }>('/api/players', {
        method: 'POST',
        body,
      })

      if (response.data) {
        const newPlayer: Player = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          imageUrl: response.data.imageUrl || '',
        }

        await fetchPlayers()
        addPlayerToTeam(pendingTeam.value, newPlayer)
        success('Player added successfully')
        closeAddPlayerDialog()
      }
    } catch (error: any) {
      console.error('Failed to add player:', error)
      const errorMessage =
        error?.data?.error || error?.message || 'Failed to add player'
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('E11000')
      ) {
        showError('A player with this name already exists.')
      } else {
        showError(errorMessage)
      }
    }
  }

  const updateValue = () => {
    emit('update:modelValue', {
      teamA: selectedPlayersA.value.map(p => p.name),
      teamB: selectedPlayersB.value.map(p => p.name),
    })
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    // Close dropdown A
    if (
      showDropdownA.value &&
      !inputA.value?.contains(target) &&
      !dropdownA.value?.contains(target)
    ) {
      showDropdownA.value = false
    }

    // Close dropdown B
    if (
      showDropdownB.value &&
      !inputB.value?.contains(target) &&
      !dropdownB.value?.contains(target)
    ) {
      showDropdownB.value = false
    }
  }

  watch([searchTeamA, searchTeamB], () => {
    nextTick(() => {
      if (showDropdownA.value) updateDropdownPosition('A')
      if (showDropdownB.value) updateDropdownPosition('B')
    })
  })

  watch(showDropdownA, show => {
    if (show) nextTick(() => updateDropdownPosition('A'))
  })

  watch(showDropdownB, show => {
    if (show) nextTick(() => updateDropdownPosition('B'))
  })

  const initializeSelectedPlayers = () => {
    if (allPlayers.value.length === 0) return

    const teamANames = props.modelValue?.teamA || []
    const teamBNames = props.modelValue?.teamB || []

    selectedPlayersA.value = teamANames
      .map(name => allPlayers.value.find(p => p.name === name))
      .filter((p): p is Player => p !== undefined)

    selectedPlayersB.value = teamBNames
      .map(name => allPlayers.value.find(p => p.name === name))
      .filter((p): p is Player => p !== undefined)
  }

  watch(
    () => props.modelValue,
    () => {
      initializeSelectedPlayers()
    },
    { deep: true }
  )

  watch(allPlayers, () => {
    initializeSelectedPlayers()
  })

  onMounted(async () => {
    await fetchPlayers()
    initializeSelectedPlayers()
    document.addEventListener('click', handleClickOutside)
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
