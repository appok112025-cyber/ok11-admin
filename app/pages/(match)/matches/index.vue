<template>
  <div class="flex flex-col min-h-[calc(100vh-4rem)] space-y-6">
    <PageHeader title="Matches" description="Manage and view match data">
      <template #actions>
        <NuxtLink
          to="/matches/add"
          :class="[
            'inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            loading ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          aria-label="Add new match"
        >
          <svg
            class="w-5 h-5 mr-2"
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
          Add Match
        </NuxtLink>
      </template>
    </PageHeader>

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
          <h3 class="text-sm font-medium text-red-800">
            Error loading matches
          </h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden relative">
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
                Match #
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Teams
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Match Time
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Participants
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
              v-for="match in paginatedMatches"
              :key="match.id"
              @click="navigateToMatch(match.id)"
              @keydown.enter="navigateToMatch(match.id)"
              @keydown.space.prevent="navigateToMatch(match.id)"
              tabindex="0"
              role="button"
              :aria-label="`View details for ${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'}`"
              class="hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ match.matchNumber }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{
                    match.matchName ||
                    `${match.teamA?.name || 'Team A'} vs ${
                      match.teamB?.name || 'Team B'
                    }`
                  }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDateTime(match.matchTime) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-800': match.status === 'Completed',
                    'bg-yellow-100 text-yellow-800': match.status === 'Live',
                    'bg-blue-100 text-blue-800': match.status === 'Upcoming',
                    'bg-red-100 text-red-800': match.status === 'Cancelled',
                  }"
                >
                  {{ match.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ match.participantsCount || 0 }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                @click.stop
              >
                <div class="flex items-center justify-end gap-2">
                  <!-- <span
                    v-if="match.quizzes && match.quizzes.length > 0"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                    title="Has quizzes"
                  >
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    {{ match.quizzes.length }} Quiz{{
                      match.quizzes.length > 1 ? 'zes' : ''
                    }}
                  </span> -->
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="paginatedMatches.length === 0 && matches.length > 0"
        class="text-center py-12"
      >
        <p class="text-sm text-gray-500">No matches on this page.</p>
      </div>
      <div v-else-if="matches.length === 0" class="text-center py-12">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-4 text-sm font-medium text-gray-900">No matches</h3>
        <p class="mt-2 text-sm text-gray-500">
          There are no matches available at the moment.
        </p>
      </div>
    </div>

    <!-- Spacer to push pagination to bottom -->
    <div class="flex-grow"></div>

    <!-- Pagination - Fixed at bottom -->
    <div
      v-if="matches.length > 0"
      class="bg-white shadow-lg rounded-xl px-4 py-4 sm:px-6 mt-auto"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <!-- Mobile: Simple Previous/Next -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        <!-- Desktop: Full pagination controls -->
        <div
          class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
        >
          <!-- Results info -->
          <div class="flex-shrink-0">
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-semibold text-gray-900">{{
                startIndex + 1
              }}</span>
              to
              <span class="font-semibold text-gray-900">{{ endIndex }}</span>
              of
              <span class="font-semibold text-gray-900">{{
                totalMatches
              }}</span>
              results
            </p>
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-4">
            <!-- Items per page -->
            <div class="flex items-center gap-2">
              <label
                for="items-per-page"
                class="text-sm text-gray-700 whitespace-nowrap"
              >
                Items per page:
              </label>
              <select
                id="items-per-page"
                v-model="itemsPerPage"
                class="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-2 bg-white"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>

            <!-- Page navigation -->
            <nav
              class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors',
                  page === currentPage
                    ? 'z-10 bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { formatDateTime } from '~/utils/common/date'
  import { usePagination } from '~/composables/common/usePagination'
  import { useMatches } from '~/composables/matches/useMatches'
  const route = useRoute()

  definePageMeta({
    layout: 'admin',
  })

  const { matches, loading, error, navigateToMatch, loadMatches } = useMatches()

  const {
    currentPage,
    itemsPerPage,
    totalItems: totalMatches,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedMatches,
    visiblePages,
    isChangingPage,
    goToPage,
  } = usePagination(matches, 10)

  onMounted(() => {
    loadMatches()
  })

  // Reload matches when navigating back to this page
  onActivated(() => {
    loadMatches()
  })

  // Also watch for route changes to reload
  watch(
    () => route.path,
    newPath => {
      if (newPath === '/matches') {
        loadMatches()
      }
    }
  )
</script>
