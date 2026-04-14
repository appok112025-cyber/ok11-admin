<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] overflow-y-auto"
        @click.self="$emit('close')"
      >
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="$emit('close')"
        ></div>
        <div
          class="relative flex items-center justify-center min-h-screen px-4 py-4 pointer-events-none"
        >
          <div
            class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full pointer-events-auto"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                  Submission Details
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    class="w-6 h-6"
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

              <div v-if="loading" class="space-y-4">
                <div class="animate-pulse space-y-3">
                  <div class="h-16 bg-gray-200 rounded"></div>
                  <div class="h-16 bg-gray-200 rounded"></div>
                  <div class="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div v-else-if="submission" class="space-y-4">
                <slot name="header" :submission="submission">
                  <div v-if="showUser" class="bg-gray-50 rounded-lg p-4">
                    <div class="text-sm font-medium text-gray-700">User</div>
                    <div class="text-base text-gray-900 mt-1">
                      {{ submission.userName || 'Unknown User' }}
                    </div>
                    <div
                      v-if="submission.userEmail"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ submission.userEmail }}
                    </div>
                  </div>

                  <div v-if="showMatch" class="bg-gray-50 rounded-lg p-4">
                    <div class="text-sm font-medium text-gray-700">Match</div>
                    <div class="text-base text-gray-900 mt-1">
                      <NuxtLink
                        v-if="submission.matchId"
                        :to="`/matches/${submission.matchId}`"
                        class="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {{ matchDisplay || 'Unknown Match' }}
                      </NuxtLink>
                      <span v-else>Unknown Match</span>
                    </div>
                  </div>
                </slot>

                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-sm font-medium text-gray-700 mb-3">
                    Selected Players
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div
                        class="text-xs font-semibold text-gray-500 uppercase mb-2"
                      >
                        Team A
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
                          class="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-200"
                        >
                          {{ player.name }}
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-500 italic">
                        No players selected
                      </div>
                    </div>
                    <div>
                      <div
                        class="text-xs font-semibold text-gray-500 uppercase mb-2"
                      >
                        Team B
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
                          class="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-200"
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
                      !submission.quizAnswers ||
                      submission.quizAnswers.length === 0
                    "
                    class="text-sm text-gray-500 text-center py-4"
                  >
                    No quiz answers available
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="(answer, index) in submission.quizAnswers"
                      :key="index"
                      class="border rounded-lg p-3"
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
                              class="text-xs"
                              :class="{
                                'font-semibold text-green-700':
                                  optIndex === answer.correctAnswer,
                                'text-gray-600':
                                  optIndex !== answer.correctAnswer &&
                                  optIndex !== answer.userSelectedOption,
                                'text-blue-600 font-medium':
                                  optIndex === answer.userSelectedOption &&
                                  optIndex !== answer.correctAnswer,
                              }"
                            >
                              {{ String.fromCharCode(65 + optIndex) }}.
                              {{
                                typeof option === 'object'
                                  ? option.text
                                  : option
                              }}
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

                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium text-blue-700">
                      Total Score
                    </div>
                    <div class="text-xl font-bold text-blue-900">
                      {{ submission.totalPointsEarned || 0 }} /
                      {{ submission.totalPoints || 0 }} ({{
                        submission.totalPoints
                          ? Math.round(
                              ((submission.totalPointsEarned || 0) /
                                submission.totalPoints) *
                                100
                            )
                          : 0
                      }}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import type { Submission } from '~/types/submission'

  interface Props {
    show: boolean
    submission: Submission | null
    loading?: boolean
    matchId?: string
    matchDisplay?: string
    showUser?: boolean
    showMatch?: boolean
  }

  withDefaults(defineProps<Props>(), {
    loading: false,
    showUser: true,
    showMatch: false,
  })

  defineEmits<{
    close: []
  }>()
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
