<template>
  <div class="space-y-6">
    <PageHeader
      title="Edit Match"
      description="Update match information"
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="goBack"
    >
      <template #actions>
        <button
          type="button"
          @click="goBack"
          :disabled="submitting"
          class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <SubmitButton
          :loading="submitting"
          :disabled="!isFormValid"
          :editing="true"
          loading-text="Updating..."
          edit-text="Update Match"
          use-gradient
          @click="handleSubmit"
        />
      </template>
    </PageHeader>

    <div
      v-if="loading"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <div class="space-y-4">
        <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>

    <div
      v-else-if="!match"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <div class="text-center py-12">
        <p class="text-gray-500">Match not found</p>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Go back
        </button>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-visible">
      <form @submit.prevent="handleSubmit" class="p-6 sm:p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="matchNumber"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Match Number <span class="text-red-500">*</span>
            </label>
            <input
              id="matchNumber"
              v-model="form.matchNumber"
              type="number"
              min="1"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter match number"
            />
          </div>

          <div>
            <label
              for="status"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Status <span class="text-red-500">*</span>
            </label>
            <select
              id="status"
              v-model="form.status"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label
            for="matchName"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Match Name
          </label>
          <input
            id="matchName"
            v-model="form.matchName"
            type="text"
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter match name (e.g., IPL 2025 Match 1)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="matchTime"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Match Date & Time <span class="text-red-500">*</span>
            </label>
            <input
              id="matchTime"
              v-model="form.matchTime"
              type="datetime-local"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label
              for="score"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Score
            </label>
            <input
              id="score"
              v-model="form.score"
              type="text"
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 245/8 - 180/6"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="teamA"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Team A <span class="text-red-500">*</span>
            </label>
            <select
              id="teamA"
              v-model="form.teamA"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a team...</option>
              <option
                v-for="team in availableTeams"
                :key="team.id"
                :value="team.id"
                :disabled="team.id === form.teamB"
              >
                {{ team.name }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="teamB"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Team B <span class="text-red-500">*</span>
            </label>
            <select
              id="teamB"
              v-model="form.teamB"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a team...</option>
              <option
                v-for="team in availableTeams"
                :key="team.id"
                :value="team.id"
                :disabled="team.id === form.teamA"
              >
                {{ team.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="relative z-[5]">
          <PlayerPicker
            v-model="safeFormPlayers"
            :team-names="teamNamesForPicker"
          />
        </div>

        <!-- Quiz Section -->
        <div class="border-t border-gray-200 pt-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-gray-900">Match Quiz</h3>
                <span
                  v-if="form.quizzes && form.quizzes.length > 0"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ form.quizzes.filter(q => q.saved).length }} /
                  {{ form.quizzes.length }} saved
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Add quiz questions for this match
              </p>
            </div>
            <AddButton label="Add Quiz" @click="addQuiz" />
          </div>

          <div v-if="form.quizzes && form.quizzes.length > 0" class="space-y-4">
            <div
              v-for="(quiz, index) in form.quizzes"
              :key="index"
              :class="[
                'border-2 rounded-lg p-4 transition-all',
                quiz.saved
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50',
              ]"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-gray-700">
                    Quiz #{{ index + 1 }}
                  </h4>
                  <span
                    v-if="quiz.saved"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Saved
                  </span>
                </div>
                <button
                  type="button"
                  @click="removeQuiz(index)"
                  class="text-red-600 hover:bg-red-50 p-1 rounded"
                  title="Remove quiz"
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

              <div class="space-y-4">
                <!-- Question Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Question <span class="text-red-500">*</span>
                  </label>
                  <div
                    v-if="!quiz.questionId || !quiz.question"
                    class="flex gap-2"
                  >
                    <select
                      v-model="quiz.questionId"
                      @change="handleQuestionSelect(index)"
                      :disabled="quiz.saved"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        Select from predefined or type new...
                      </option>
                      <option
                        v-for="q in availableQuizzes"
                        :key="q.id"
                        :value="q.id"
                      >
                        {{ q.question }}
                      </option>
                    </select>
                  </div>
                  <div v-if="quiz.questionId && quiz.question" class="mb-2">
                    <div
                      class="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 flex items-center justify-between"
                    >
                      <span>{{ quiz.question }}</span>
                      <span class="text-xs text-blue-600">(Predefined)</span>
                    </div>
                  </div>
                  <div v-if="!quiz.questionId" class="mt-2 relative">
                    <textarea
                      v-model="quiz.question"
                      :disabled="quiz.saved"
                      rows="2"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Or type your custom question here..."
                    ></textarea>
                    <button
                      v-if="
                        quiz.question.trim() && !quiz.saved && !quiz.questionId
                      "
                      type="button"
                      @click="saveAsPredefine(index)"
                      class="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Save as predefined question"
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Options -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">
                      Options (Min 2, Max 4) <span class="text-red-500">*</span>
                    </label>
                    <button
                      v-if="quiz.options.length < 4 && !quiz.saved"
                      type="button"
                      @click="addOption(index)"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(option, optIndex) in quiz.options"
                      :key="optIndex"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="option.text"
                        type="text"
                        :disabled="quiz.saved"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        :placeholder="`Option ${optIndex + 1}`"
                      />
                      <button
                        type="button"
                        @click="setCorrectAnswer(index, optIndex)"
                        :disabled="quiz.saved"
                        :class="[
                          'px-3 py-2 rounded-lg border-2 transition-colors',
                          quiz.correctAnswer === optIndex
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-600 hover:border-green-300',
                          quiz.saved && 'opacity-50 cursor-not-allowed',
                        ]"
                        title="Mark as correct answer"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        v-if="quiz.options.length > 2 && !quiz.saved"
                        type="button"
                        @click="removeOption(index, optIndex)"
                        class="text-red-600 hover:bg-red-50 p-2 rounded"
                        title="Remove option"
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
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <div>
                      <p
                        v-if="quiz.correctAnswer !== null"
                        class="text-xs text-green-600"
                      >
                        ✓ Correct answer: Option {{ quiz.correctAnswer + 1 }}
                      </p>
                      <p v-else class="text-xs text-gray-500">
                        No correct answer set (can be updated later)
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Points -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Points <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="quiz.points"
                    type="number"
                    min="1"
                    :disabled="quiz.saved"
                    class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter points for this question"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Points awarded for correct answer (default: 10)
                  </p>
                </div>

                <!-- Save Quiz Button -->
                <div
                  v-if="!quiz.saved"
                  class="flex justify-end pt-2 border-t border-gray-200"
                >
                  <button
                    type="button"
                    @click="saveQuiz(index)"
                    :disabled="!isQuizValid(quiz)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Quiz
                  </button>
                </div>
                <div
                  v-else
                  class="flex justify-end pt-2 border-t border-gray-200"
                >
                  <button
                    type="button"
                    @click="editQuiz(index)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          >
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="mt-2 text-sm text-gray-500">
              No quiz questions added yet
            </p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useMatches } from '~/composables/matches/useMatches'
  import { useQuizzes } from '~/composables/quizzes/useQuizzes'
  import { useTeams } from '~/composables/teams/useTeams'
  import { useToast } from '~/composables/common/useToast'
  import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

  definePageMeta({
    layout: 'admin',
  })

  const route = useRoute()
  const router = useRouter()
  const {
    matches,
    form,
    submitting,
    loading,
    editingMatchId,
    handleSubmit: submitMatch,
    loadMatches,
    initializeEditForm,
  } = useMatches()

  const { success: showSuccess } = useToast()
  const { quizzes: availableQuizzes, fetchQuizzes } = useQuizzes()
  const { teams: availableTeams, fetchTeams } = useTeams()

  const matchId = computed(() => {
    const params = route.params as { id: string | string[] }
    const id = params.id
    return Array.isArray(id) ? id[0] : String(id)
  })

  const match = computed(() => {
    const id = matchId.value
    const found = matches.value.find(m => m.id === id || m.id === String(id))
    return found
  })

  const isFormValid = computed(() => {
    return (
      form.value.matchNumber.trim() !== '' &&
      form.value.teamA.trim() !== '' &&
      form.value.teamB.trim() !== '' &&
      form.value.matchTime !== '' &&
      !!form.value.status
    )
  })

  const addQuiz = () => {
    if (!form.value.quizzes) {
      form.value.quizzes = []
    }
    const newQuiz: any = {
      questionId: '',
      question: '',
      options: [{ text: '' }, { text: '' }],
      correctAnswer: null,
      points: 10,
      saved: false,
    }
    form.value.quizzes.push(newQuiz)
  }

  const isQuizValid = (quiz: any) => {
    const hasQuestion = quiz.question.trim() !== '' || quiz.questionId !== ''
    const hasValidOptions =
      quiz.options.length >= 2 &&
      quiz.options.every((opt: any) => opt.text.trim() !== '')
    return hasQuestion && hasValidOptions
  }

  const saveQuiz = (index: number) => {
    const quiz = form.value.quizzes?.[index]
    if (quiz && isQuizValid(quiz)) {
      quiz.saved = true
    }
  }

  const editQuiz = (index: number) => {
    const quiz = form.value.quizzes?.[index]
    if (quiz) {
      quiz.saved = false
    }
  }

  const saveAsPredefine = async (index: number) => {
    const quiz = form.value.quizzes?.[index]
    if (!quiz || !quiz.question.trim()) return

    try {
      const response = await $fetch<{ data: any; meta?: any }>('/api/quizzes', {
        method: 'POST',
        body: { question: quiz.question.trim() },
      })

      if (response.data) {
        await fetchQuizzes()
        const newQuiz = availableQuizzes.value.find(
          q => q.question === quiz.question.trim()
        )
        if (newQuiz) {
          quiz.questionId = newQuiz.id
          showSuccess('Question saved as predefined template')
        }
      }
    } catch (error) {
      console.error('Failed to save question as predefined:', error)
    }
  }

  const removeQuiz = (index: number) => {
    form.value.quizzes?.splice(index, 1)
  }

  const addOption = (quizIndex: number) => {
    const quiz = form.value.quizzes?.[quizIndex]
    if (quiz && quiz.options.length < 4) {
      quiz.options.push({ text: '' })
    }
  }

  const removeOption = (quizIndex: number, optionIndex: number) => {
    const quiz = form.value.quizzes?.[quizIndex]
    if (quiz && quiz.options.length > 2) {
      quiz.options.splice(optionIndex, 1)
      if (quiz.correctAnswer === optionIndex) {
        quiz.correctAnswer = null
      } else if (
        quiz.correctAnswer !== null &&
        quiz.correctAnswer > optionIndex
      ) {
        quiz.correctAnswer--
      }
    }
  }

  const setCorrectAnswer = (quizIndex: number, optionIndex: number) => {
    const quiz = form.value.quizzes?.[quizIndex]
    if (quiz) {
      quiz.correctAnswer =
        quiz.correctAnswer === optionIndex ? null : optionIndex
    }
  }

  const handleQuestionSelect = (quizIndex: number) => {
    const quiz = form.value.quizzes?.[quizIndex]
    if (quiz) {
      if (quiz.questionId) {
        const selectedQuiz = availableQuizzes.value.find(
          q => q.id === quiz.questionId
        )
        if (selectedQuiz) {
          quiz.question = selectedQuiz.question
        }
      } else {
        quiz.question = ''
      }
    }
  }

  const teamNamesForPicker = computed(() => {
    const teamA = availableTeams.value.find(t => t.id === form.value.teamA)
    const teamB = availableTeams.value.find(t => t.id === form.value.teamB)
    return {
      team1: teamA?.name || '',
      team2: teamB?.name || '',
    }
  })

  const safeFormPlayers = computed({
    get: () => form.value.players || { teamA: [], teamB: [] },
    set: value => {
      form.value.players = value
    },
  })

  const goBack = () => {
    // Use matchId directly since match.value might be stale after update
    if (matchId.value) {
      router.replace(`/matches/${matchId.value}`)
    } else {
      router.push('/matches')
    }
  }

  const handleSubmit = async () => {
    console.log(
      'Edit page: Starting submit, editingMatchId:',
      editingMatchId.value
    )
    const success = await submitMatch()
    console.log(
      'Edit page: After submit,',
      'success:',
      success,
      'editingMatchId:',
      editingMatchId.value
    )

    if (success) {
      console.log('Edit page: Submit completed successfully, navigating back')
      goBack()
    } else {
      console.log('Edit page: Submit failed, staying on page to allow fixes')
    }
  }

  // Track if form has been initialized to prevent re-initialization
  const formInitialized = ref(false)

  watch(
    () => [matches.value.length, matchId.value, availableQuizzes.value.length],
    async () => {
      if (
        matches.value.length > 0 &&
        match.value &&
        !editingMatchId.value &&
        !formInitialized.value
      ) {
        console.log('Edit page: Initializing form from watcher, match data:', {
          id: match.value.id,
          teamA: match.value.teamA,
          teamB: match.value.teamB,
          players: match.value.players,
          quizzes: match.value.quizzes?.length,
        })
        await initializeEditForm(match.value)

        if (form.value.quizzes && availableQuizzes.value.length > 0) {
          form.value.quizzes.forEach((quiz, index) => {
            if (quiz.questionId && !quiz.question) {
              handleQuestionSelect(index)
            }
          })
        }

        formInitialized.value = true
        console.log(
          'Edit page: Form initialized, teamA:',
          form.value.teamA,
          'teamB:',
          form.value.teamB,
          'players:',
          form.value.players
        )
      }
    },
    { immediate: true }
  )

  onMounted(async () => {
    console.log('Edit page: Mounted, loading data')
    if (matches.value.length === 0) {
      await loadMatches()
    }
    await fetchQuizzes()
    await fetchTeams()
    await nextTick()

    if (match.value && !formInitialized.value) {
      console.log('Edit page: Initializing form from onMounted')
      await initializeEditForm(match.value)

      if (form.value.quizzes && availableQuizzes.value.length > 0) {
        form.value.quizzes.forEach((quiz, index) => {
          if (quiz.questionId && !quiz.question) {
            handleQuestionSelect(index)
          }
        })
      }

      formInitialized.value = true
    }
  })

  // Reset formInitialized when leaving the page
  onUnmounted(() => {
    formInitialized.value = false
  })
</script>
