<template>
  <div class="space-y-6">
    <PageHeader
      title="Submission Details"
      description="View detailed submission information"
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="goBack"
    />

    <div
      v-if="loading"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <div class="animate-pulse space-y-4">
        <div class="h-16 bg-gray-200 rounded"></div>
        <div class="h-16 bg-gray-200 rounded"></div>
        <div class="h-32 bg-gray-200 rounded"></div>
      </div>
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
            Error loading submission
          </h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div
      v-else-if="!submission"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <div class="text-center py-12">
        <p class="text-sm text-gray-500">Submission not found</p>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <div class="p-6 sm:p-8">
        <div class="space-y-6">
          <!-- User Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-700">User</div>
            <div class="text-base text-gray-900 mt-1">
              {{ submission.userName || 'Unknown User' }}
            </div>
            <div v-if="submission.userEmail" class="text-sm text-gray-500 mt-1">
              {{ submission.userEmail }}
            </div>
          </div>

          <!-- Selected Players -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-700 mb-3">
              Selected Players
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {{ submission.match?.teamA?.name || 'Team A' }}
                </div>
                <div
                  v-if="
                    submission.teamASelectedPlayers &&
                    submission.teamASelectedPlayers.length > 0
                  "
                  class="space-y-1"
                >
                  <div
                    v-for="player in submission.teamASelectedPlayers"
                    :key="player.id"
                    class="text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-200"
                  >
                    {{ player.name }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">
                  No players selected
                </div>
              </div>
              <div>
                <div class="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {{ submission.match?.teamB?.name || 'Team B' }}
                </div>
                <div
                  v-if="
                    submission.teamBSelectedPlayers &&
                    submission.teamBSelectedPlayers.length > 0
                  "
                  class="space-y-1"
                >
                  <div
                    v-for="player in submission.teamBSelectedPlayers"
                    :key="player.id"
                    class="text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-200"
                  >
                    {{ player.name }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">
                  No players selected
                </div>
              </div>
            </div>
          </div>

          <!-- Quiz Answers -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-700 mb-3">
              Quiz Answers
              <span
                v-if="submission.quizAnswers"
                class="text-gray-500 font-normal"
              >
                ({{ submission.quizAnswers.length }})
              </span>
            </div>
            <div
              v-if="
                !submission.quizAnswers || submission.quizAnswers.length === 0
              "
              class="text-sm text-gray-500 text-center py-4"
            >
              No quiz answers available
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="(answer, index) in submission.quizAnswers"
                :key="index"
                class="border rounded-lg p-4 bg-white"
                :class="{
                  'border-green-300 bg-green-50': answer.isCorrect,
                  'border-red-300 bg-red-50': !answer.isCorrect,
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900 mb-2">
                      {{ answer.question || `Question ${index + 1}` }}
                    </div>
                    <div
                      v-if="answer.options && answer.options.length > 0"
                      class="space-y-1 mb-2"
                    >
                      <div
                        v-for="(option, optIndex) in answer.options"
                        :key="optIndex"
                        class="text-sm px-3 py-2 rounded"
                        :class="{
                          'font-semibold text-green-700 bg-green-100':
                            optIndex === answer.correctAnswer,
                          'text-gray-600 bg-white':
                            optIndex !== answer.correctAnswer &&
                            optIndex !== answer.userSelectedOption,
                          'text-blue-600 font-medium bg-blue-50':
                            optIndex === answer.userSelectedOption &&
                            optIndex !== answer.correctAnswer,
                        }"
                      >
                        {{ String.fromCharCode(65 + optIndex) }}.
                        {{ typeof option === 'object' ? option.text : option }}
                        <span
                          v-if="optIndex === answer.correctAnswer"
                          class="ml-1 text-green-600"
                          >✓</span
                        >
                        <span
                          v-if="
                            optIndex === answer.userSelectedOption &&
                            optIndex !== answer.correctAnswer
                          "
                          class="ml-1 text-blue-600"
                          >(Your answer)</span
                        >
                      </div>
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      Selected: Option
                      {{
                        (answer.userSelectedOption !== undefined
                          ? answer.userSelectedOption
                          : answer.selectedOption) + 1
                      }}
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <div
                      class="text-sm font-semibold"
                      :class="{
                        'text-green-700': answer.isCorrect,
                        'text-red-700': !answer.isCorrect,
                      }"
                    >
                      {{ answer.isCorrect ? '✓ Correct' : '✗ Wrong' }}
                    </div>
                    <div class="text-xs text-gray-600 mt-1">
                      {{ answer.pointsEarned || 0 }} /
                      {{ answer.points || 0 }} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Score -->
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-blue-700">Total Score</div>
              <div class="text-xl font-bold text-blue-900">
                {{ submission.totalPointsEarned || 0 }} /
                {{ submission.totalPoints || 0 }}
                <span class="text-base font-medium text-blue-700 ml-2">
                  ({{
                    submission.totalPoints
                      ? Math.round(
                          ((submission.totalPointsEarned || 0) /
                            submission.totalPoints) *
                            100
                        )
                      : 0
                  }}%)
                </span>
              </div>
            </div>
          </div>

          <!-- Submission Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm font-medium text-gray-700">Status</div>
              <span
                class="inline-block mt-1 px-2 py-1 rounded text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800':
                    submission.status === 'evaluated',
                  'bg-yellow-100 text-yellow-800':
                    submission.status === 'pending',
                  'bg-gray-100 text-gray-800':
                    submission.status === 'completed',
                }"
              >
                {{ submission.status || 'pending' }}
              </span>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm font-medium text-gray-700">Submitted At</div>
              <div class="text-base text-gray-900 mt-1">
                {{ formatDateTime(submission.submittedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { formatDateTime } from '~/utils/common/date'
  import { useSubmissions } from '~/composables/common/useSubmissions'
  import type { Submission } from '~/types/submission'

  definePageMeta({
    layout: 'admin',
  })

  const route = useRoute()
  const router = useRouter()

  const { getSubmission } = useSubmissions()

  const submission = ref<Submission | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const matchId = computed(() => {
    const params = route.params as { id: string | string[] }
    const id = params.id
    return Array.isArray(id) ? id[0] : String(id)
  })

  const submissionId = computed(() => {
    const params = route.params as { submissionId: string | string[] }
    const id = params.submissionId
    return Array.isArray(id) ? id[0] : String(id)
  })

  const loadSubmissionData = async () => {
    if (!submissionId.value) return

    loading.value = true
    error.value = null

    try {
      const data = await getSubmission(submissionId.value)
      if (data) {
        submission.value = data
      } else {
        error.value = 'Submission not found'
      }
    } catch (err: any) {
      console.error('Error loading submission:', err)
      error.value = err.message || 'Failed to load submission'
    } finally {
      loading.value = false
    }
  }

  const goBack = () => {
    // Go back to the match submissions list
    router.push(`/matches/${matchId.value}/submissions`)
  }

  onMounted(() => {
    loadSubmissionData()
  })

  watch(submissionId, () => {
    loadSubmissionData()
  })
</script>
