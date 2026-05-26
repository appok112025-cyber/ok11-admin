<template>
  <div class="space-y-6">
    <PageHeader
      title="Dashboard"
      description="Overview of your admin panel and key metrics"
    />

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ loading ? '...' : stats.totalUsers }}
            </p>
          </div>
          <div
            class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-blue-600"
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
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Matches</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ loading ? '...' : stats.totalMatches }}
            </p>
          </div>
          <div
            class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Matches</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ loading ? '...' : stats.activeMatches }}
            </p>
          </div>
          <div
            class="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Submissions</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ loading ? '...' : stats.totalSubmissions }}
            </p>
          </div>
          <div
            class="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div> -->
    </div>

    <!-- Match Related -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Match Related</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          to="/matches"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">View Matches</p>
            <p class="text-xs text-gray-500">Manage match data</p>
          </div>
        </NuxtLink>

        <!-- <NuxtLink
          to="/submissions"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">View Submissions</p>
            <p class="text-xs text-gray-500">Manage match submissions</p>
          </div>
        </NuxtLink> -->

        <NuxtLink
          to="/teams"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Manage Teams</p>
            <p class="text-xs text-gray-500">View and manage teams</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/players"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-indigo-600"
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
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Manage Players</p>
            <p class="text-xs text-gray-500">View and manage players</p>
          </div>
        </NuxtLink>

        <!-- <NuxtLink
          to="/quizzes"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Manage Quizzes</p>
            <p class="text-xs text-gray-500">View and manage quizzes</p>
          </div>
        </NuxtLink> -->
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          to="/users"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-blue-600"
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
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Manage Users</p>
            <p class="text-xs text-gray-500">View and manage users</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/faqs"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Manage FAQs</p>
            <p class="text-xs text-gray-500">Edit and reorder FAQs</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/about"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-cyan-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">About Page</p>
            <p class="text-xs text-gray-500">Edit about page content</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/terms"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Terms & Conditions</p>
            <p class="text-xs text-gray-500">Edit terms and conditions</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/points"
          class="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Points System</p>
            <p class="text-xs text-gray-500">Edit points system content</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
  })

  interface DashboardStats {
    totalUsers: number
    totalMatches: number
    activeMatches: number
    totalSubmissions?: number
  }

  const loading = ref(true)
  const stats = ref<DashboardStats>({
    totalUsers: 0,
    totalMatches: 0,
    activeMatches: 0,
  })

  const fetchStats = async () => {
    try {
      loading.value = true
      const response = await $fetch<{ data: DashboardStats; meta?: any }>(
        '/api/dashboard/stats'
      )
      console.log('Dashboard stats response:', response)
      if (response.data) {
        stats.value = {
          totalUsers: response.data.totalUsers || 0,
          totalMatches: response.data.totalMatches || 0,
          activeMatches: response.data.activeMatches || 0,
        }
        console.log('Dashboard stats set:', stats.value)
      } else {
        console.warn('No data in dashboard stats response')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchStats()
  })
</script>
