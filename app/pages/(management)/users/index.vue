<template>
  <div class="space-y-6">
    <!-- Users List View -->
    <PageHeader title="Users" description="Manage and view user profiles" />

    <div
      v-if="loading"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <ShimmerTable :rows="5" />
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading users</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden relative">
      <!-- Search & Sorting Toolbar -->
      <div class="p-6 border-b border-gray-150 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Search Bar -->
        <div class="relative w-full sm:max-w-md">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name, email, phone..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <!-- Sorting Option -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label class="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort By:</label>
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-gray-700"
          >
            <option value="createdAt_desc">Date Joined (Newest)</option>
            <option value="createdAt_asc">Date Joined (Oldest)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="walletBalance_desc">Wallet Balance (Highest)</option>
            <option value="walletBalance_asc">Wallet Balance (Lowest)</option>
          </select>
        </div>
      </div>

      <div
        v-if="isChangingPage"
        class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Wallet Balance
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Info
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              @click="navigateToUser(user.id)"
              @keydown.enter="navigateToUser(user.id)"
              @keydown.space.prevent="navigateToUser(user.id)"
              tabindex="0"
              role="button"
              :aria-label="`View profile for ${user.name || user.email || 'User'}`"
              class="hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    v-if="user.photoURL && !failedAvatars.has(user.id)"
                    class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200"
                  >
                    <img
                      :src="user.photoURL"
                      :alt="user.name || user.email || 'User'"
                      class="h-full w-full object-cover"
                      @error="handleAvatarError(user.id)"
                    />
                  </div>
                  <div
                    v-else
                    class="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                  >
                    <span class="text-white font-semibold text-sm">
                      {{
                        (user.name || user.email || 'U').charAt(0).toUpperCase()
                      }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name || user.email || 'Unknown User' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ user.phone || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black text-green-650">₹{{ (user.walletBalance || 0).toFixed(2) }}</span>
                  <button
                    @click="openAddMoneyModal(user)"
                    class="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 active:scale-95 border border-blue-100"
                    title="Add Money"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                    Add Money
                  </button>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                @click.stop
              >
                <svg
                  class="w-5 h-5 text-gray-400 inline-block"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="paginatedUsers.length === 0 && users.length > 0"
        class="text-center py-12"
      >
        <p class="text-sm text-gray-500">No users on this page.</p>
      </div>
      <div v-else-if="users.length === 0" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No users</h3>
        <p class="mt-1 text-sm text-gray-500">No users found in the system.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="users.length > 0"
      class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl"
    >
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ startIndex + 1 }}</span>
            to
            <span class="font-medium">{{ endIndex }}</span>
            of
            <span class="font-medium">{{ totalUsers }}</span>
            results
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-2">
            <label for="itemsPerPage" class="text-sm text-gray-700">
              Per page:
            </label>
            <select
              id="itemsPerPage"
              v-model="itemsPerPage"
              @change="currentPage = 1"
              class="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>
          <nav
            class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Add Money Dialog -->
    <div v-if="showAddMoneyDialog" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6 space-y-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Add Money to Wallet</h3>
          <p class="text-sm text-gray-500">User: <strong class="text-gray-700">{{ selectedUserForMoney?.name || selectedUserForMoney?.email }}</strong></p>
        </div>
        
        <div class="space-y-2">
          <label class="block text-xs font-bold text-gray-400 uppercase">Amount to Add (₹)</label>
          <div class="relative flex items-center">
            <span class="absolute left-3 text-gray-500 font-bold">₹</span>
            <input
              v-model.number="addMoneyAmount"
              type="number"
              min="1"
              class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="100"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="closeAddMoneyModal"
            class="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
            :disabled="addingMoney"
          >
            Cancel
          </button>
          <button
            @click="submitAddMoney"
            class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            :disabled="addingMoney || !addMoneyAmount || addMoneyAmount <= 0"
          >
            <svg v-if="addingMoney" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ addingMoney ? 'Adding...' : 'Add Money' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUsers } from '~/composables/users/useUsers'
  import { usePagination } from '~/composables/common/usePagination'
  import { useToast } from '~/composables/common/useToast'

  const route = useRoute()
  const { success: toastSuccess, error: toastError } = useToast()

  definePageMeta({
    layout: 'admin',
  })

  const { users, loading, error, navigateToUser, loadUsers } = useUsers()

  // Search & Sorting state
  const searchQuery = ref('')
  const sortBy = ref('createdAt_desc')

  // Filtered and sorted computed list of users
  const filteredAndSortedUsers = computed(() => {
    let result = [...users.value]

    const query = searchQuery.value.toLowerCase().trim()
    if (query) {
      result = result.filter(user => {
        const name = (user.name || '').toLowerCase()
        const email = (user.email || '').toLowerCase()
        const phone = (user.phone || '').toLowerCase()
        return name.includes(query) || email.includes(query) || phone.includes(query)
      })
    }

    result.sort((a, b) => {
      if (sortBy.value === 'createdAt_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy.value === 'createdAt_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy.value === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '')
      } else if (sortBy.value === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '')
      } else if (sortBy.value === 'walletBalance_asc') {
        return (a.walletBalance || 0) - (b.walletBalance || 0)
      } else if (sortBy.value === 'walletBalance_desc') {
        return (b.walletBalance || 0) - (a.walletBalance || 0)
      }
      return 0
    })

    return result
  })

  // Add Money state & methods
  const showAddMoneyDialog = ref(false)
  const selectedUserForMoney = ref<any>(null)
  const addMoneyAmount = ref<number | null>(100)
  const addingMoney = ref(false)

  const openAddMoneyModal = (user: any) => {
    selectedUserForMoney.value = user
    addMoneyAmount.value = 100
    showAddMoneyDialog.value = true
  }

  const closeAddMoneyModal = () => {
    showAddMoneyDialog.value = false
    selectedUserForMoney.value = null
    addMoneyAmount.value = null
  }

  const submitAddMoney = async () => {
    if (!selectedUserForMoney.value || !addMoneyAmount.value || addMoneyAmount.value <= 0) return
    
    addingMoney.value = true
    try {
      const userId = selectedUserForMoney.value.id
      const res = await $fetch<any>(`/api/users/${userId}/add-money`, {
        method: 'POST',
        body: { amount: addMoneyAmount.value }
      })
      
      // Update locally
      const idx = users.value.findIndex(u => u.id === userId)
      if (idx !== -1) {
        users.value[idx].walletBalance = res.walletBalance !== undefined ? res.walletBalance : (users.value[idx].walletBalance || 0) + addMoneyAmount.value
      }
      
      toastSuccess(`Successfully added ₹${addMoneyAmount.value} to ${selectedUserForMoney.value.name || 'user'}'s wallet!`)
      closeAddMoneyModal()
    } catch (e: any) {
      toastError(e.data?.message || e.message || 'Failed to add money')
    } finally {
      addingMoney.value = false
    }
  }

  // Track failed avatar images to show fallback
  const failedAvatars = ref<Set<string>>(new Set())

  const handleAvatarError = (userId: string) => {
    failedAvatars.value.add(userId)
  }

  const {
    currentPage,
    itemsPerPage,
    totalItems: totalUsers,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedUsers,
    visiblePages,
    isChangingPage,
    goToPage,
  } = usePagination(filteredAndSortedUsers, 10)

  // Reset page to 1 when search or sorting changes
  watch([searchQuery, sortBy], () => {
    currentPage.value = 1
  })

  onMounted(() => {
    loadUsers()
  })

  // Reload users when navigating back to this page
  onActivated(() => {
    loadUsers()
  })

  // Also watch for route changes to reload
  watch(
    () => route.path,
    newPath => {
      if (newPath === '/users') {
        loadUsers()
      }
    }
  )
</script>
