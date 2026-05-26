<template>
  <div class="space-y-6">
    <PageHeader
      title="All Contests"
      description="View and manage all active, upcoming, and completed contests"
    />

    <div class="bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-100">
      <!-- Search & Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="relative w-full sm:max-w-xs">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by contest or match name..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div class="flex gap-2 w-full sm:w-auto justify-end">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4 py-6">
        <div class="h-8 bg-gray-100 rounded w-full animate-pulse"></div>
        <div class="h-12 bg-gray-100 rounded w-full animate-pulse" v-for="i in 5" :key="i"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredContests.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-sm font-bold text-gray-900">No contests found</h3>
        <p class="mt-1 text-xs text-gray-500">Try adjusting your search query or status filter.</p>
      </div>

      <!-- Contests Table -->
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contest Name</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider uppercase">Match</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 tracking-wider uppercase">Prize Pool</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 tracking-wider uppercase">Entry Fee</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 tracking-wider uppercase">Spots Joined</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 tracking-wider uppercase">Status</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="c in filteredContests"
              :key="c.id || c._id"
              @click="redirectToContest(c)"
              class="hover:bg-blue-50/50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-gray-900 flex items-center gap-1.5">
                  {{ c.name }}
                  <span v-if="c.isLocked" class="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black tracking-wider">LOCKED</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-700" v-if="c.matchId">
                  {{ c.matchId.teamA?.name || 'A' }} <span class="text-gray-400 font-normal">vs</span> {{ c.matchId.teamB?.name || 'B' }}
                </div>
                <div class="text-xs text-gray-400" v-if="c.matchId">
                  {{ c.matchId.status || 'Upcoming' }}
                </div>
                <span v-else class="text-sm text-gray-400 italic">No Match Linked</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">
                ₹{{ c.firstPrize || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-black">
                <span v-if="c.entryFee === 0" class="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">FREE</span>
                <span v-else class="text-gray-900">₹{{ c.entryFee }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="text-sm font-bold text-blue-600">
                  {{ c.totalParticipants || 0 }} <span class="text-gray-400 font-normal">/ {{ c.participantLimit }}</span>
                </div>
                <div class="w-20 bg-gray-100 rounded-full h-1 mt-1 mx-auto overflow-hidden">
                  <div
                    class="bg-blue-600 h-1 rounded-full"
                    :style="{ width: Math.min(100, ((c.totalParticipants || 0) / (c.participantLimit || 1)) * 100) + '%' }"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="px-2.5 py-1 text-xs font-black uppercase rounded-full tracking-wider"
                  :class="{
                    'bg-green-100 text-green-800': c.status === 'Live',
                    'bg-blue-100 text-blue-800': c.status === 'Upcoming',
                    'bg-gray-100 text-gray-800': c.status === 'Completed',
                    'bg-red-100 text-red-800': c.status === 'Cancelled',
                  }"
                >
                  {{ c.status || 'Upcoming' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click.stop="redirectToContest(c)"
                  class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  Manage
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/common/useToast'

definePageMeta({ layout: 'admin' })

const { error } = useToast()
const loading = ref(true)
const contests = ref<any[]>([])
const searchQuery = ref('')
const statusFilter = ref('')

const fetchAllContests = async () => {
  try {
    loading.value = true
    const res = await $fetch<any>('/api/contests')
    contests.value = res.data || []
  } catch (e: any) {
    error('Failed to load contests')
    console.error('Error fetching contests:', e)
  } finally {
    loading.value = false
  }
}

const filteredContests = computed(() => {
  return contests.value.filter(c => {
    // 1. Search Query
    const query = searchQuery.value.toLowerCase().trim()
    let matchesSearch = true
    if (query) {
      const nameMatch = c.name?.toLowerCase().includes(query)
      const teamAMatch = c.matchId?.teamA?.name?.toLowerCase().includes(query)
      const teamBMatch = c.matchId?.teamB?.name?.toLowerCase().includes(query)
      matchesSearch = nameMatch || teamAMatch || teamBMatch
    }

    // 2. Status Filter
    let matchesStatus = true
    if (statusFilter.value) {
      matchesStatus = c.status?.toLowerCase() === statusFilter.value.toLowerCase()
    }

    return matchesSearch && matchesStatus
  })
})

const redirectToContest = (c: any) => {
  const matchId = c.matchId?._id || c.matchId?.id || c.matchId
  if (matchId) {
    navigateTo(`/matches/${matchId}/contests`)
  } else {
    error('Cannot redirect: No match ID associated with this contest')
  }
}

onMounted(() => {
  fetchAllContests()
})
</script>
