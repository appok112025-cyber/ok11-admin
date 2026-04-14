<template>
  <div class="space-y-6">
    <PageHeader
      title="User Submissions"
      :description="
        user ? `${user.name} (${user.email})` : 'View user submissions'
      "
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="goBack"
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
            <div class="text-sm font-medium text-purple-600">
              Total Points Earned
            </div>
            <div class="text-2xl font-bold text-purple-900 mt-1">
              {{ totalPointsEarned }}
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
                Match
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
                Status
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
                <div class="text-sm font-medium text-gray-900">
                  <NuxtLink
                    :to="`/matches/${submission.matchId}`"
                    class="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {{ getMatchDisplay(submission.matchId) }}
                  </NuxtLink>
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
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-800':
                      submission.status === 'completed',
                    'bg-yellow-100 text-yellow-800':
                      submission.status === 'evaluated',
                    'bg-blue-100 text-blue-800':
                      submission.status === 'pending',
                  }"
                >
                  {{ submission.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="viewDetails(submission)"
                  class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View
                </button>
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
          This user hasn't submitted any predictions yet.
        </p>
      </div>
    </div>

    <SubmissionDetailsModal
      :show="!!selectedSubmission"
      :submission="selectedSubmission"
      :loading="submissionLoading"
      :match-id="selectedSubmission?.matchId"
      :match-display="
        selectedSubmission?.matchId
          ? getMatchDisplay(selectedSubmission.matchId)
          : undefined
      "
      :show-user="false"
      :show-match="true"
      @close="closeDetails"
    />
  </div>
</template>

<script setup lang="ts">
  import { formatDateTime } from '~/utils/common/date'
  import { useSubmissions } from '~/composables/common/useSubmissions'
  import { useMatches } from '~/composables/matches/useMatches'
  import { useUsers } from '~/composables/users/useUsers'
  import type { Submission } from '~/types/submission'

  definePageMeta({
    layout: 'admin',
  })

  const route = useRoute()
  const router = useRouter()

  const { submissions, loading, error, loadSubmissions, getSubmission } =
    useSubmissions()
  const { matches, loadMatches } = useMatches()
  const { users, loadUsers } = useUsers()

  const selectedSubmission = ref<Submission | null>(null)
  const submissionLoading = ref(false)

  const userId = computed(() => {
    const params = route.params as { id: string | string[] }
    const id = params.id
    return Array.isArray(id) ? id[0] : String(id)
  })

  const user = computed(() => {
    return users.value.find((u: any) => u.id === userId.value)
  })

  const averageScore = computed(() => {
    if (submissions.value.length === 0) return 0
    const total = submissions.value.reduce(
      (sum: number, s: Submission) => sum + getScorePercentage(s),
      0
    )
    return Math.round(total / submissions.value.length)
  })

  const totalPointsEarned = computed(() => {
    return submissions.value.reduce(
      (sum: number, s: Submission) => sum + s.totalPointsEarned,
      0
    )
  })

  const getScorePercentage = (submission: Submission) => {
    if (submission.totalPoints === 0) return 0
    return Math.round(
      (submission.totalPointsEarned / submission.totalPoints) * 100
    )
  }

  const getMatchDisplay = (matchId: string) => {
    const match = matches.value.find((m: any) => m.id === matchId)
    if (!match) {
      return `Match ${matchId}`
    }
    const teamAName =
      match.teamA?.name ||
      (typeof match.teamA === 'object' ? match.teamA?.name : 'Team A')
    const teamBName =
      match.teamB?.name ||
      (typeof match.teamB === 'object' ? match.teamB?.name : 'Team B')
    return `Match #${match.matchNumber} - ${teamAName} vs ${teamBName}`
  }

  const viewDetails = async (submission: Submission) => {
    submissionLoading.value = true
    try {
      const fullSubmission = await getSubmission(submission.id)
      if (fullSubmission) {
        selectedSubmission.value = fullSubmission
      } else {
        selectedSubmission.value = submission
      }
    } catch (err) {
      console.error('Error loading submission details:', err)
      selectedSubmission.value = submission
    } finally {
      submissionLoading.value = false
    }
  }

  const closeDetails = () => {
    selectedSubmission.value = null
  }

  const goBack = () => {
    router.push('/users')
  }

  onMounted(async () => {
    await loadUsers()
    await loadMatches()
    await loadSubmissions({ userId: userId.value })
  })
</script>
