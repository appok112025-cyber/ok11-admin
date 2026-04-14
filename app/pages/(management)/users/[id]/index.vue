<script setup lang="ts">
  import { formatDate } from '~/utils/common/date'
  import { useUsers } from '~/composables/users/useUsers'

  definePageMeta({
    layout: 'admin',
    key: route => {
      const params = route.params as Record<string, string | string[]>
      const id = params.id
      return `user-${Array.isArray(id) ? id[0] : id || 'unknown'}`
    },
  })

  const route = useRoute()
  const router = useRouter()
  const {
    selectedUser,
    loadingUser,
    showBlockDialog,
    blocking,
    showDeleteDialog,
    deleting,
    closeUserModal,
    openUserModal,
    handleBlockUser,
    confirmBlockUser,
    handleDeleteUser,
    confirmDeleteUser,
  } = useUsers()

  // Track if avatar image failed to load
  const avatarLoadFailed = ref(false)

  const navigateToSubmission = (match: any) => {
    if (match.matchId && match.submissionId) {
      router.push(`/matches/${match.matchId}/submissions/${match.submissionId}`)
    }
  }

  const userId = computed(() => {
    const params = route.params as Record<string, string | string[]>
    const id = params.id
    return Array.isArray(id) ? id[0] : String(id || '')
  })

  // Load user when page mounts or route changes
  const loadUser = async () => {
    if (!userId.value) return

    // Reset avatar error state when loading new user
    avatarLoadFailed.value = false

    try {
      await openUserModal(userId.value)
    } catch (error: any) {
      console.error('Error loading user:', error)
    }
  }

  const handleAvatarError = () => {
    avatarLoadFailed.value = true
  }

  // Load on mount (client-side only per Vue docs)
  onMounted(() => {
    loadUser()
  })

  // Reload when navigating back to this page (for keep-alive)
  onActivated(() => {
    loadUser()
  })

  // Watch for route changes and load user data
  watch(
    () => {
      const params = route.params as Record<string, string | string[]>
      return params.id
    },
    async id => {
      const currentUserId = Array.isArray(id) ? id[0] : String(id || '')
      if (currentUserId && currentUserId !== selectedUser.value?.id) {
        try {
          await openUserModal(currentUserId)
        } catch (error: any) {
          console.error('Error loading user:', error)
        }
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="User Profile"
      description="View user details and matches"
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="closeUserModal"
    />

    <div
      v-if="loadingUser"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <ShimmerTable :rows="3" />
    </div>

    <div
      v-else-if="selectedUser"
      class="bg-white shadow-lg rounded-xl overflow-hidden"
    >
      <div class="p-6 sm:p-8">
        <div class="space-y-6">
          <div class="flex items-start space-x-4 pb-6 border-b border-gray-200">
            <div
              v-if="selectedUser.photoURL && !avatarLoadFailed"
              class="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-200"
            >
              <img
                :src="selectedUser.photoURL"
                :alt="selectedUser.name || selectedUser.email || 'User'"
                class="h-full w-full object-cover"
                @error="handleAvatarError"
              />
            </div>
            <div
              v-else
              class="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
            >
              <span class="text-white font-bold text-xl">
                {{
                  (selectedUser.name || selectedUser.email || 'U')
                    .charAt(0)
                    .toUpperCase()
                }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <h4 class="text-xl font-bold text-gray-900">
                    {{
                      selectedUser.name || selectedUser.email || 'Unknown User'
                    }}
                  </h4>
                  <span
                    v-if="selectedUser.blocked"
                    class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"
                  >
                    Blocked
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="handleBlockUser"
                    :disabled="blocking"
                    :class="[
                      'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      selectedUser.blocked
                        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
                      blocking ? 'opacity-50 cursor-not-allowed' : '',
                    ]"
                    aria-label="Block or unblock user"
                  >
                    <svg
                      v-if="!blocking"
                      class="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        v-if="selectedUser.blocked"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        v-else
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    <svg
                      v-else
                      class="animate-spin w-4 h-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span class="text-sm">
                      {{ selectedUser.blocked ? 'Unblock' : 'Block' }}
                    </span>
                  </button>
                  <button
                    type="button"
                    @click="handleDeleteUser"
                    :disabled="deleting"
                    :class="[
                      'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
                      deleting ? 'opacity-50 cursor-not-allowed' : '',
                    ]"
                    aria-label="Delete user"
                  >
                    <svg
                      v-if="!deleting"
                      class="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <svg
                      v-else
                      class="animate-spin w-4 h-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span class="text-sm">Delete</span>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                {{ selectedUser.email }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Phone Number
              </label>
              <p class="text-sm text-gray-900">
                {{ selectedUser.phone || 'Not provided' }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Last Logged In
              </label>
              <p class="text-sm text-gray-900">
                {{ formatDate(selectedUser.lastLoggedIn) }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Sign Up Date
              </label>
              <p class="text-sm text-gray-900">
                {{ formatDate(selectedUser.createdAt) }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                App Version
              </label>
              <p class="text-sm text-gray-900">
                {{ selectedUser.appVersion || 'N/A' }}
              </p>
            </div>
          </div>

          <div v-if="selectedUser.matches && selectedUser.matches.length > 0">
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3"
            >
              Matches Data
            </label>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="space-y-3">
                <button
                  v-for="(match, index) in selectedUser.matches"
                  :key="index"
                  @click="navigateToSubmission(match)"
                  class="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-gray-900">
                      Match {{ index + 1 }}
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">
                        {{ formatDate(match.date) }}
                      </span>
                      <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Team:</span>
                      <span class="ml-2 text-gray-900">{{ match.team }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Score:</span>
                      <span class="ml-2 text-gray-900">{{ match.score }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Points:</span>
                      <span class="ml-2 text-gray-900 font-semibold">
                        {{ match.points }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500">Status:</span>
                      <span
                        class="ml-2 px-2 py-1 rounded text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': match.status === 'Won',
                          'bg-red-100 text-red-800': match.status === 'Lost',
                          'bg-yellow-100 text-yellow-800':
                            match.status === 'Pending',
                        }"
                      >
                        {{ match.status }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-500">No matches data available</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden p-6">
      <div class="text-center py-12">
        <p class="text-sm text-gray-500">User not found</p>
      </div>
    </div>

    <ConfirmDialog
      :show="showBlockDialog"
      :title="selectedUser?.blocked ? 'Unblock User' : 'Block User'"
      :message="
        selectedUser?.blocked
          ? `Are you sure you want to unblock ${selectedUser?.name || selectedUser?.email || 'this user'}? They will be able to access the app again.`
          : `Are you sure you want to block ${selectedUser?.name || selectedUser?.email || 'this user'}? They will not be able to access the app.`
      "
      type="danger"
      confirm-text="Confirm"
      cancel-text="Cancel"
      :loading="blocking"
      @confirm="confirmBlockUser"
      @cancel="showBlockDialog = false"
    />

    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete User"
      :message="`Are you sure you want to delete ${selectedUser?.name || selectedUser?.email || 'this user'}? This action cannot be undone and all user data will be permanently removed.`"
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="deleting"
      @confirm="confirmDeleteUser"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
