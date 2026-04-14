<template>
  <div class="space-y-6">
    <PageHeader
      :title="'Match Submissions'"
      :description="
        match
          ? `${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'} - Match #${match.matchNumber}`
          : 'View match submissions'
      "
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="goBack"
    >
      <template #actions>
        <NuxtLink
          :to="`/matches/${matchId}`"
          class="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="View match"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Match
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
            Error loading submissions
          </h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-sm font-medium text-blue-600">
              Total Submissions
            </div>
            <div class="text-2xl font-bold text-blue-900 mt-1">
              {{ submissions.length }}
            </div>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-sm font-medium text-green-600">Average Score</div>
            <div class="text-2xl font-bold text-green-900 mt-1">
              {{ averageScore }}%
            </div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-sm font-medium text-purple-600">Highest Score</div>
            <div class="text-2xl font-bold text-purple-900 mt-1">
              {{ highestScore }}%
            </div>
          </div>
        </div>
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
                Selected Player
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Quiz Score
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Submitted At
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="submission in submissions"
              :key="submission.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <span class="text-white font-semibold text-sm">
                      {{ submission.userName.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ submission.userName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ submission.userEmail }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ submission.selectedPlayer }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ submission.totalPointsEarned }} /
                  {{ submission.totalPoints }}
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="h-2 rounded-full"
                    :class="{
                      'bg-green-500': getScorePercentage(submission) >= 70,
                      'bg-yellow-500':
                        getScorePercentage(submission) >= 40 &&
                        getScorePercentage(submission) < 70,
                      'bg-red-500': getScorePercentage(submission) < 40,
                    }"
                    :style="{ width: getScorePercentage(submission) + '%' }"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDateTime(submission.submittedAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <NuxtLink
                  :to="`/matches/${matchId}/submissions/${submission.id}`"
                  class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="submissions.length === 0" class="text-center py-12">
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
        <h3 class="mt-4 text-sm font-medium text-gray-900">
          No submissions yet
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          No users have submitted predictions for this match.
        </p>
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
  })

  const route = useRoute()
  const router = useRouter()

  const matchId = computed(() => {
    const params = route.params as { id: string | string[] }
    const id = params.id
    return Array.isArray(id) ? id[0] : String(id)
  })

  const { matches, loadMatches } = useMatches()
  const { submissions, loading, error, loadSubmissions } = useSubmissions()

  const match = computed(() => {
    return matches.value.find((m: any) => m.id === matchId.value)
  })

  const averageScore = computed(() => {
    if (submissions.value.length === 0) return 0
    const total = submissions.value.reduce(
      (sum: number, s: Submission) => sum + getScorePercentage(s),
      0
    )
    return Math.round(total / submissions.value.length)
  })

  const highestScore = computed(() => {
    if (submissions.value.length === 0) return 0
    return Math.max(
      ...submissions.value.map((s: Submission) => getScorePercentage(s))
    )
  })

  const getScorePercentage = (submission: Submission) => {
    if (submission.totalPoints === 0) return 0
    return Math.round(
      (submission.totalPointsEarned / submission.totalPoints) * 100
    )
  }

  const goBack = () => {
    router.push(`/matches/${matchId.value}`)
  }

  onMounted(async () => {
    await loadMatches()
    await loadSubmissions({ matchId: matchId.value })
  })
</script>
