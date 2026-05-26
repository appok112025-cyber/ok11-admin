<template>
  <div class="space-y-6">
    <PageHeader
      title="Match Details"
      description="View match information and participants"
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="closeMatchDetail"
    >
      <template #actions>
        <div v-if="selectedMatch" class="flex gap-3">
          <button
            @click="handleDeleteMatch(selectedMatch.id)"
            :disabled="submitting"
            class="inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete match"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Match
          </button>
          <!-- <NuxtLink
            :to="`/matches/${selectedMatch.id}/submissions`"
            class="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="View submissions"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Submissions
          </NuxtLink> -->
          <NuxtLink
            :to="`/matches/${selectedMatch.id}/contests`"
            class="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            aria-label="Manage Contests"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Manage Contests
          </NuxtLink>
          <NuxtLink
            :to="`/matches/${selectedMatch.id}/edit`"
            class="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Edit match"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Match
          </NuxtLink>
        </div>
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
      v-else-if="!selectedMatch"
      class="bg-white shadow-lg rounded-xl overflow-hidden p-6"
    >
      <div class="text-center py-12">
        <p class="text-gray-500">Match not found</p>
        <button
          @click="closeMatchDetail"
          class="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Go back to matches
        </button>
      </div>
    </div>

    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <div class="p-6 sm:p-8">
        <div class="space-y-6">
          <div class="pb-6 border-b border-gray-200">
            <div
              class="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="selectedMatch.teamA?.imageUrl && !teamAImageError"
                    :src="selectedMatch.teamA.imageUrl"
                    :alt="selectedMatch.teamA.name"
                    class="w-full h-full object-contain p-1"
                    @error="handleTeamAImageError"
                  />
                  <div
                    v-if="!selectedMatch.teamA?.imageUrl || teamAImageError"
                    class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center rounded-full"
                  >
                    <span class="text-white font-bold text-sm sm:text-base">
                      {{ (selectedMatch.teamA?.name || 'A').charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="min-w-0">
                  <h3
                    class="text-base sm:text-lg font-bold text-gray-900 truncate"
                  >
                    {{ selectedMatch.teamA?.name || 'Team A' }}
                  </h3>
                </div>

                <span
                  class="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 flex-shrink-0"
                  >VS</span
                >

                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="selectedMatch.teamB?.imageUrl && !teamBImageError"
                    :src="selectedMatch.teamB.imageUrl"
                    :alt="selectedMatch.teamB.name"
                    class="w-full h-full object-contain p-1"
                    @error="handleTeamBImageError"
                  />
                  <div
                    v-if="!selectedMatch.teamB?.imageUrl || teamBImageError"
                    class="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center rounded-full"
                  >
                    <span class="text-white font-bold text-sm sm:text-base">
                      {{ (selectedMatch.teamB?.name || 'B').charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="min-w-0">
                  <h3
                    class="text-base sm:text-lg font-bold text-gray-900 truncate"
                  >
                    {{ selectedMatch.teamB?.name || 'Team B' }}
                  </h3>
                </div>
              </div>

              <div class="flex items-center gap-3 flex-shrink-0">
                <div
                  class="px-2 py-1 bg-gray-50 rounded border border-gray-200"
                >
                  <span class="text-xs font-semibold text-gray-500">#</span>
                  <span class="text-xs font-bold text-gray-900 ml-1">{{
                    selectedMatch.matchNumber
                  }}</span>
                </div>
                <span
                  class="px-2 py-1 rounded text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-800':
                      selectedMatch.status === 'Completed',
                    'bg-yellow-100 text-yellow-800':
                      selectedMatch.status === 'Live',
                    'bg-blue-100 text-blue-800':
                      selectedMatch.status === 'Upcoming',
                    'bg-red-100 text-red-800':
                      selectedMatch.status === 'Cancelled',
                  }"
                >
                  {{ selectedMatch.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="selectedMatch.matchName">
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Match Name
              </label>
              <p class="text-sm text-gray-900 font-medium">
                {{ selectedMatch.matchName }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Match Date & Time
              </label>
              <p class="text-sm text-gray-900">
                {{ formatDateTime(selectedMatch.matchTime) }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Status
              </label>
              <p class="text-sm text-gray-900">
                {{ selectedMatch.status }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Score
              </label>
              <p class="text-sm text-gray-900">
                {{ selectedMatch.score || 'Not available' }}
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Opted-in Users / Contest Entries
              </label>
              <p class="text-sm text-gray-900 font-bold">
                {{ selectedMatch.participantsCount || 0 }} users opted in • {{ totalContestParticipants }} contest entries
              </p>
            </div>
          </div>

          <!-- Players Section - Accordion -->
          <div class="mt-8 border-t border-gray-200 pt-6">
            <button
              @click="playersExpanded = !playersExpanded"
              class="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                Players
                <span
                  v-if="
                    selectedMatch.players &&
                    (selectedMatch.players.teamA?.length > 0 ||
                      selectedMatch.players.teamB?.length > 0)
                  "
                  class="ml-2 text-base font-normal text-gray-500"
                >
                  ({{
                    (selectedMatch.players?.teamA?.length || 0) +
                    (selectedMatch.players?.teamB?.length || 0)
                  }})
                </span>
              </h3>
              <svg
                class="w-5 h-5 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': playersExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="playersExpanded"
              class="mt-4 transition-all duration-200"
            >
              <div
                v-if="
                  selectedMatch.players &&
                  (selectedMatch.players.teamA?.length > 0 ||
                    selectedMatch.players.teamB?.length > 0)
                "
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <!-- Team A Players -->
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-3">
                    {{ selectedMatch.teamA?.name || 'Team A' }}
                  </h4>
                  <div
                    v-if="
                      selectedMatch.players.teamA &&
                      selectedMatch.players.teamA.length > 0
                    "
                    class="space-y-2"
                  >
                    <div
                      v-for="(player, index) in selectedMatch.players.teamA"
                      :key="index"
                      class="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div class="flex items-center">
                        <div
                          class="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                        >
                          <span class="text-white font-semibold text-xs">
                            {{
                              getPlayerName(player)?.charAt(0).toUpperCase() ||
                              '?'
                            }}
                          </span>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">
                            {{ getPlayerName(player) || 'Unknown Player' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="bg-gray-50 rounded-lg p-3 text-center">
                    <p class="text-xs text-gray-500">No players</p>
                  </div>
                </div>

                <!-- Team B Players -->
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-3">
                    {{ selectedMatch.teamB?.name || 'Team B' }}
                  </h4>
                  <div
                    v-if="
                      selectedMatch.players.teamB &&
                      selectedMatch.players.teamB.length > 0
                    "
                    class="space-y-2"
                  >
                    <div
                      v-for="(player, index) in selectedMatch.players.teamB"
                      :key="index"
                      class="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div class="flex items-center">
                        <div
                          class="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center"
                        >
                          <span class="text-white font-semibold text-xs">
                            {{
                              getPlayerName(player)?.charAt(0).toUpperCase() ||
                              '?'
                            }}
                          </span>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">
                            {{ getPlayerName(player) || 'Unknown Player' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="bg-gray-50 rounded-lg p-3 text-center">
                    <p class="text-xs text-gray-500">No players</p>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <p class="text-sm text-gray-500">
                  No players assigned to this match
                </p>
              </div>
            </div>
          </div>

          <!-- Contests Section - Accordion -->
          <div class="mt-8 border-t border-gray-200 pt-6">
            <button
              @click="contestsExpanded = !contestsExpanded"
              class="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                Match Contests
                <span
                  v-if="matchContests.length > 0"
                  class="ml-2 text-base font-normal text-gray-500"
                >
                  ({{ matchContests.length }})
                </span>
              </h3>
              <svg
                class="w-5 h-5 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': contestsExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="contestsExpanded"
              class="mt-4 transition-all duration-200"
            >
              <div v-if="contestsLoading" class="p-4 text-center text-gray-400">
                Loading contests...
              </div>
              <div
                v-else-if="matchContests.length > 0"
                class="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
              >
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contest Name</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prize Pool</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Entry Fee</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Participants</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr
                        v-for="contest in matchContests"
                        :key="contest.id || contest._id"
                        @click="router.push(`/matches/${selectedMatch.id}/contests`)"
                        class="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                          {{ contest.name }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-black text-gray-900">
                          ₹{{ contest.firstPrize }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <span v-if="contest.entryFee === 0" class="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded text-xs">FREE</span>
                          <span v-else class="text-gray-900 font-semibold">₹{{ contest.entryFee }}</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                          {{ contest.totalParticipants || 0 }} / {{ contest.participantLimit }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                            :class="{
                              'bg-green-100 text-green-800': contest.status === 'Live',
                              'bg-blue-100 text-blue-800': contest.status === 'Upcoming',
                              'bg-gray-100 text-gray-800': contest.status === 'Completed',
                            }"
                          >
                            {{ contest.status }}
                          </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center text-sm">
                          <NuxtLink
                            :to="`/matches/${selectedMatch.id}/contests`"
                            class="text-xs font-bold text-blue-600 hover:text-blue-800"
                            @click.stop
                          >
                            Manage
                          </NuxtLink>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                v-else
                class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <p class="text-sm text-gray-500">
                  No contests configured for this match.
                </p>
                <NuxtLink
                  :to="`/matches/${selectedMatch.id}/contests`"
                  class="mt-2 inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Create first contest →
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Quizzes Section - Accordion -->
          <!-- <div class="mt-8 border-t border-gray-200 pt-6">
            <button
              @click="quizzesExpanded = !quizzesExpanded"
              class="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                Match Quizzes
                <span
                  v-if="
                    selectedMatch.quizzes && selectedMatch.quizzes.length > 0
                  "
                  class="ml-2 text-base font-normal text-gray-500"
                >
                  ({{ selectedMatch.quizzes.length }})
                </span>
              </h3>
              <svg
                class="w-5 h-5 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': quizzesExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="quizzesExpanded"
              class="mt-4 transition-all duration-200"
            >
              <div
                v-if="selectedMatch.quizzes && selectedMatch.quizzes.length > 0"
                class="space-y-4"
              >
                <div
                  v-for="(quiz, index) in selectedMatch.quizzes"
                  :key="index"
                  class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-gray-900 mb-2">
                        Question #{{ index + 1 }}
                      </h4>
                      <p class="text-sm text-gray-700">{{ quiz.question }}</p>
                    </div>
                    <span
                      class="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                    >
                      {{ quiz.points }} pts
                    </span>
                  </div>
                  <div class="space-y-2 mt-3">
                    <div
                      v-for="(option, optIndex) in quiz.options"
                      :key="optIndex"
                      :class="[
                        'flex items-center px-3 py-2 rounded text-sm',
                        quiz.correctAnswer === optIndex
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'bg-white text-gray-700',
                      ]"
                    >
                      <span class="mr-2 font-semibold"
                        >{{ String.fromCharCode(65 + optIndex) }}.</span
                      >
                      <span>{{ option.text }}</span>
                      <svg
                        v-if="quiz.correctAnswer === optIndex"
                        class="ml-auto w-4 h-4 text-green-600"
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
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <p class="text-sm text-gray-500">
                  No quizzes available for this match
                </p>
              </div>
            </div>
          </div> -->

          <!-- Submissions Section -->
          <!-- <div class="mt-8 border-t border-gray-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <label
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Submissions
                <span
                  v-if="matchSubmissions.length > 0"
                  class="normal-case font-normal text-gray-600"
                >
                  ({{ matchSubmissions.length }})
                </span>
              </label>
              <NuxtLink
                :to="`/matches/${selectedMatch.id}/submissions`"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </NuxtLink>
            </div>

            <div v-if="submissionsLoading" class="bg-gray-50 rounded-lg p-4">
              <div class="animate-pulse space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>

            <div
              v-else-if="submissionsError"
              class="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p class="text-sm text-red-700">{{ submissionsError }}</p>
            </div>

            <div
              v-else-if="matchSubmissions.length > 0"
              class="bg-gray-50 rounded-lg overflow-hidden"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                    <tr>
                      <th
                        class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Score
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr
                      v-for="submission in matchSubmissions.slice(0, 5)"
                      :key="submission.id"
                      @click="navigateToSubmission(submission.id)"
                      class="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center">
                          <div
                            class="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                          >
                            <span class="text-white font-semibold text-xs">
                              {{
                                submission.userName
                                  ? submission.userName.charAt(0).toUpperCase()
                                  : '?'
                              }}
                            </span>
                          </div>
                          <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">
                              {{ submission.userName || 'Unknown User' }}
                            </div>
                            <div
                              v-if="submission.userEmail"
                              class="text-xs text-gray-500"
                            >
                              {{ submission.userEmail }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ submission.totalPointsEarned || 0 }} /
                          {{ submission.totalPoints || 0 }}
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            class="h-1.5 rounded-full"
                            :class="{
                              'bg-green-500':
                                getSubmissionScorePercentage(submission) >= 70,
                              'bg-yellow-500':
                                getSubmissionScorePercentage(submission) >=
                                  40 &&
                                getSubmissionScorePercentage(submission) < 70,
                              'bg-red-500':
                                getSubmissionScorePercentage(submission) < 40,
                              }"
                            :style="{
                              width:
                                getSubmissionScorePercentage(submission) + '%',
                            }"
                          ></div>
                        </div>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <span
                          class="px-2 py-1 rounded text-xs font-medium"
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
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center justify-between">
                          <div class="text-sm text-gray-900">
                            {{
                              submission.submittedAt
                                ? formatDateTime(submission.submittedAt)
                                : 'N/A'
                            }}
                          </div>
                          <svg
                            class="w-4 h-4 text-gray-400 ml-2"
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
                v-if="matchSubmissions.length > 5"
                class="bg-gray-100 px-4 py-3 text-center border-t border-gray-200"
              >
                <NuxtLink
                  :to="`/matches/${selectedMatch.id}/submissions`"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {{ matchSubmissions.length }} submissions →
                </NuxtLink>
              </div>
            </div>
            <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">No submissions yet</p>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Match"
      message="Are you sure you want to delete this match? This action cannot be undone."
      type="danger"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="submitting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { formatDateTime } from '~/utils/common/date'
  import { useMatches } from '~/composables/matches/useMatches'
  // import { useSubmissions } from '~/composables/common/useSubmissions'
  // import type { Submission } from '~/types/submission'

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

  const {
    matches,
    loading,
    selectedMatch,
    closeMatchDetail,
    loadMatches,
    submitting,
    handleDelete,
  } = useMatches()

  const showDeleteDialog = ref(false)
  const matchToDelete = ref<string | null>(null)
  const playersExpanded = ref(false)
  const quizzesExpanded = ref(false)
  const contestsExpanded = ref(true)

  const matchContests = ref<any[]>([])
  const contestsLoading = ref(false)

  const fetchMatchContests = async () => {
    if (!matchId.value) return
    try {
      contestsLoading.value = true
      const res = await $fetch<any>(`/api/contests?matchId=${matchId.value}`)
      matchContests.value = res.data || []
    } catch (e) {
      console.error('Error fetching match contests:', e)
    } finally {
      contestsLoading.value = false
    }
  }

  const totalContestParticipants = computed(() => {
    return matchContests.value.reduce((sum, c) => sum + (c.totalParticipants || 0), 0)
  })

  // const {
  //   submissions: allSubmissions,
  //   loading: submissionsLoading,
  //   error: submissionsError,
  //   loadSubmissions,
  // } = useSubmissions()

  // const matchSubmissions = computed(() => {
  //   if (!selectedMatch.value?.id) return []
  //   return allSubmissions.value.filter(
  //     (s: Submission) => s.matchId === selectedMatch.value?.id
  //   )
  // })

  // const navigateToSubmission = (submissionId: string) => {
  //   router.push(`/matches/${matchId.value}/submissions/${submissionId}`)
  // }

  // const getSubmissionScorePercentage = (submission: Submission) => {
  //   if (!submission.totalPoints || submission.totalPoints === 0) return 0
  //   return Math.round(
  //     ((submission.totalPointsEarned || 0) / submission.totalPoints) * 100
  //   )
  // }

  const getPlayerName = (
    player: string | { id: string; name: string } | any
  ): string => {
    if (typeof player === 'string') {
      // If it's just an ID string, it means the player couldn't be resolved
      return 'Player ID: ' + player
    }
    if (player && typeof player === 'object' && player.name) {
      return player.name
    }
    return 'Unknown Player'
  }

  const teamAImageError = ref(false)
  const teamBImageError = ref(false)

  const handleTeamAImageError = () => {
    teamAImageError.value = true
  }

  const handleTeamBImageError = () => {
    teamBImageError.value = true
  }

  watch(
    () => selectedMatch.value?.teamA?.imageUrl,
    () => {
      teamAImageError.value = false
    }
  )

  watch(
    () => selectedMatch.value?.teamB?.imageUrl,
    () => {
      teamBImageError.value = false
    }
  )

  const handleDeleteMatch = (matchId: string) => {
    matchToDelete.value = matchId
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (matchToDelete.value) {
      await handleDelete(matchToDelete.value)
      showDeleteDialog.value = false
      matchToDelete.value = null
    }
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
    matchToDelete.value = null
  }

  // Load match data when component mounts
  onMounted(async () => {
    await loadMatches()

    // After matches are loaded, find and set the selected match
    const params = route.params as { id?: string }
    const matchId = params.id
    if (matchId && matches.value.length > 0) {
      const match = matches.value.find((m: any) => m.id === matchId)
      if (match) {
        selectedMatch.value = { ...match }
        // Load submissions for this match
        // await loadSubmissions({ matchId })
      }
    }
    await fetchMatchContests()
  })

  // Reload when navigating back to this page
  onActivated(async () => {
    await loadMatches()
    const params = route.params as { id?: string }
    const matchId = params.id
    if (matchId && matches.value.length > 0) {
      const match = matches.value.find((m: any) => m.id === matchId)
      if (match) {
        selectedMatch.value = { ...match }
        // Load submissions for this match
        // await loadSubmissions({ matchId })
      }
    }
    await fetchMatchContests()
  })

  // Watch for route changes
  watch(
    () => {
      const params = route.params as { id?: string }
      return params.id
    },
    async matchId => {
      if (matchId && typeof matchId === 'string') {
        await loadMatches()
        const match = matches.value.find((m: any) => m.id === matchId)
        if (match) {
          selectedMatch.value = { ...match }
          // Load submissions for this match
          // await loadSubmissions({ matchId })
        }
        await fetchMatchContests()
      }
    }
  )
</script>
""
