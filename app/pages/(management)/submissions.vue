<template>
  <div class="flex flex-col min-h-[calc(100vh-4rem)] space-y-6">
    <PageHeader
      title="Submissions"
      description="View and manage all match submissions"
    />

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
            Error loading submissions
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
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Match
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Score
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Submitted At
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
              v-for="submission in paginatedSubmissions"
              :key="submission.id"
              @click="navigateToSubmission(submission)"
              @keydown.enter="navigateToSubmission(submission)"
              @keydown.space.prevent="navigateToSubmission(submission)"
              tabindex="0"
              role="button"
              :aria-label="`View details for submission by ${submission.userName}`"
              class="hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <span class="text-white font-semibold text-sm">
                      {{ submission.userName?.charAt(0)?.toUpperCase() || 'U' }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ submission.userName || 'Unknown User' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ submission.userEmail || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ getMatchDisplay(submission.matchId) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ submission.totalPointsEarned || 0 }} /
                  {{ submission.totalPoints || 0 }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getScorePercentage(submission) }}%
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-800':
                      submission.status === 'pending',
                    'bg-blue-100 text-blue-800':
                      submission.status === 'evaluated',
                    'bg-green-100 text-green-800':
                      submission.status === 'completed',
                  }"
                >
                  {{ submission.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDateTime(submission.submittedAt) }}
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
        v-if="paginatedSubmissions.length === 0 && submissions.length > 0"
        class="text-center py-12"
      >
        <p class="text-sm text-gray-500">No submissions on this page.</p>
      </div>
      <div v-else-if="submissions.length === 0" class="text-center py-12">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-4 text-sm font-medium text-gray-900">No submissions</h3>
        <p class="mt-2 text-sm text-gray-500">
          There are no submissions available at the moment.
        </p>
      </div>
    </div>

    <div class="flex-grow"></div>

    <div
      v-if="submissions.length > 0"
      class="bg-white shadow-lg rounded-xl px-4 py-4 sm:px-6 mt-auto"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
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

        <div
          class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
        >
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
                totalSubmissions
              }}</span>
              results
            </p>
          </div>

          <div class="flex items-center gap-4">
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
  import { useSubmissions } from '~/composables/common/useSubmissions'
  import { useMatches } from '~/composables/matches/useMatches'
  import type { Submission } from '~/types/submission'

  definePageMeta({
    layout: 'admin',
    name: 'submissions',
  })

  const route = useRoute()
  const router = useRouter()

  const { submissions, loading, error, loadSubmissions } = useSubmissions()
  const { matches, loadMatches } = useMatches()

  const paginationMeta = ref<any>(null)

  const totalSubmissions = ref(0)

  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const isChangingPage = ref(false)

  const paginatedSubmissions = computed(() => submissions.value)

  const totalPages = computed(() => {
    if (totalSubmissions.value === 0) return 1
    return Math.ceil(totalSubmissions.value / itemsPerPage.value)
  })

  const startIndex = computed(
    () => (currentPage.value - 1) * itemsPerPage.value
  )
  const endIndex = computed(() =>
    Math.min(startIndex.value + itemsPerPage.value, totalSubmissions.value)
  )

  const visiblePages = computed(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      isChangingPage.value = true
      currentPage.value = page
      if (process.client) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => {
        isChangingPage.value = false
      }, 200)
    }
  }

  const getMatchDisplay = (matchId: string) => {
    const match = matches.value.find((m: any) => m.id === matchId)
    if (!match) return 'Unknown Match'
    return `Match #${match.matchNumber} - ${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'}`
  }

  const getScorePercentage = (submission: Submission) => {
    if (submission.totalPoints === 0) return 0
    return Math.round(
      ((submission.totalPointsEarned || 0) / submission.totalPoints) * 100
    )
  }

  const navigateToSubmission = (submission: Submission) => {
    router.push(`/matches/${submission.matchId}/submissions/${submission.id}`)
  }

  const fetchSubmissions = async () => {
    paginationMeta.value = await loadSubmissions({
      page: currentPage.value,
      limit: itemsPerPage.value,
    })

    if (paginationMeta.value) {
      totalSubmissions.value = paginationMeta.value.total || 0
    } else {
      totalSubmissions.value = submissions.value.length
    }
  }

  watch(itemsPerPage, () => {
    currentPage.value = 1
  })

  watch([currentPage, itemsPerPage], () => {
    fetchSubmissions()
  })

  onMounted(async () => {
    await loadMatches()
    await fetchSubmissions()
  })

  onActivated(() => {
    fetchSubmissions()
  })

  watch(
    () => route.path,
    newPath => {
      if (newPath === '/submissions') {
        fetchSubmissions()
      }
    }
  )
</script>
