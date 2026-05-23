<template>
  <div class="space-y-6">
    <PageHeader
      title="Match Contests"
      description="Create and manage multiple contests for this match"
      :show-mobile-menu="false"
      :show-back-button="true"
      @back="router.push(`/matches` + (matchId ? '' : ''))" 
    />

    <div v-if="loading" class="bg-white shadow-lg rounded-xl overflow-hidden p-6 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="h-10 bg-gray-200 rounded"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Contest List & Create Form -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Create Contest -->
        <div class="bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Create New Contest
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contest Name</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. Mega Contest">
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Prize Pool (₹)</label>
                <input v-model="form.firstPrize" type="number" class="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs" placeholder="10000">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Entry Fee (₹)</label>
                <input v-model="form.entryFee" type="number" class="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs" placeholder="49">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Spots Limit</label>
                <input v-model="form.participantLimit" type="number" class="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs" placeholder="100">
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.isLocked" type="checkbox" id="isLocked" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label for="isLocked" class="text-sm font-medium text-gray-700">Lock Contest (Coming Soon)</label>
            </div>
            <button @click="createContest" class="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Contest' }}
            </button>
          </div>
        </div>

        <!-- Existing Contests List -->
        <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 class="font-bold text-gray-900">Available Contests ({{ contests.length }})</h3>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-if="contests.length === 0" class="p-8 text-center text-gray-400 text-sm italic">
              No contests created yet.
            </div>
            <div 
              v-for="c in contests" 
              :key="c._id" 
              @click="selectContest(c)"
              :class="['p-4 cursor-pointer hover:bg-blue-50 transition-colors group relative', selectedContestId === c._id ? 'bg-blue-50 border-l-4 border-blue-600' : '']"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-gray-900 group-hover:text-blue-700 flex items-center gap-2">
                    {{ c.name }}
                    <span v-if="c.isLocked" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">LOCKED</span>
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">₹{{ c.firstPrize }} Pool • ₹{{ c.entryFee }} Entry</p>
                </div>
                <span class="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {{ c.totalParticipants }} joined
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contest Details & Leaderboard -->
      <div class="lg:col-span-2">
        <div v-if="selectedContest" class="space-y-6">
          <!-- Active Contest Info -->
          <div class="bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                 <h3 class="text-2xl font-black text-gray-900">{{ selectedContest.name }}</h3>
                 <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-black uppercase rounded-full tracking-wider">{{ selectedContest.status }}</span>
                 <span v-if="selectedContest.isLocked" class="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase rounded-full tracking-wider">Coming Soon</span>
              </div>
              
              <div class="flex items-center gap-3">
                <button
                  @click="toggleLock"
                  :class="['flex items-center gap-2 px-4 py-2 font-bold border rounded-lg active:scale-95 transition-all text-sm', selectedContest.isLocked ? 'text-amber-600 border-amber-100 bg-amber-50 hover:bg-amber-100' : 'text-gray-600 border-gray-100 hover:bg-gray-50']"
                  :disabled="updatingLock"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  {{ selectedContest.isLocked ? 'Unlock Contest' : 'Lock (Coming Soon)' }}
                </button>

                <button
                  @click="deleteContest"
                  class="flex items-center gap-2 px-4 py-2 text-red-600 font-bold border border-red-100 rounded-lg hover:bg-red-50 active:scale-95 transition-all text-sm"
                  :disabled="deleting"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete
                </button>

                <button
                  @click="showPointsDialog = true"
                  class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Update Points
                </button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Prize Pool</div>
                <div class="text-xl font-black text-gray-900">₹{{ selectedContest.firstPrize }}</div>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Entry Fee (₹)</div>
                <div class="flex items-baseline gap-1 mt-1 flex-wrap">
                  <span v-if="selectedContest.entryFee === 0 && selectedContest.originalEntryFee > 0" class="text-xs text-gray-400 line-through">₹{{ selectedContest.originalEntryFee }}</span>
                  <input
                    v-model.number="selectedContest.entryFee"
                    type="number"
                    @change="updateEntryFee"
                    class="w-16 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none text-xl font-black text-gray-900"
                  >
                  <span v-if="selectedContest.entryFee === 0" class="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase">FREE</span>
                  
                  <!-- Clickable Quick Toggles -->
                  <button 
                    v-if="selectedContest.entryFee > 0"
                    @click="makeContestFree"
                    class="ml-2 text-[9px] bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase transition-all duration-150 active:scale-95"
                  >
                    Make Free
                  </button>
                  <button 
                    v-else-if="selectedContest.entryFee === 0 && selectedContest.originalEntryFee > 0"
                    @click="restoreContestPrice"
                    class="ml-2 text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase transition-all duration-150 active:scale-95"
                  >
                    Restore
                  </button>
                </div>
              </div>
              <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div class="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Participants Limit</div>
                <div class="flex items-baseline gap-1.5 mt-1">
                  <span class="text-xl font-black text-blue-600">{{ selectedContest.totalParticipants }}</span>
                  <span class="text-xs text-gray-400">/</span>
                  <input
                    v-model.number="selectedContest.participantLimit"
                    type="number"
                    @change="updateLimit"
                    class="w-16 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none text-sm font-bold text-gray-700"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Prize Breakdown Section -->
          <div class="bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-100 space-y-4">
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Prize Pool Distribution Breakdown
            </h3>
            
            <!-- Display breakdown list -->
            <div v-if="selectedContest.prizeBreakdown && selectedContest.prizeBreakdown.length > 0" class="overflow-hidden border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Rank Range</th>
                    <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Prize Amount</th>
                    <th class="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase w-16">Action</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="(range, idx) in selectedContest.prizeBreakdown" :key="idx" class="hover:bg-gray-50">
                    <td class="px-4 py-2.5 text-sm font-medium text-gray-700">
                      {{ range.fromRank === range.toRank ? `Rank ${range.fromRank}` : `Rank ${range.fromRank} - ${range.toRank}` }}
                    </td>
                    <td class="px-4 py-2.5 text-sm font-black text-green-600 text-right">
                      ₹{{ range.prizeAmount }}
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <button @click="deleteBreakdownRange(idx)" class="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No prize distribution configured yet. Add ranges below!
            </div>

            <!-- Add Range Form -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div class="text-xs font-bold text-gray-700">Add Range Split</div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] text-gray-400 font-bold uppercase mb-1">From Rank</label>
                  <input v-model.number="newRange.fromRank" type="number" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400" placeholder="1">
                </div>
                <div>
                  <label class="block text-[10px] text-gray-400 font-bold uppercase mb-1">To Rank</label>
                  <input v-model.number="newRange.toRank" type="number" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400" placeholder="1">
                </div>
                <div>
                  <label class="block text-[10px] text-gray-400 font-bold uppercase mb-1">Prize (₹)</label>
                  <input v-model.number="newRange.prizeAmount" type="number" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400" placeholder="500">
                </div>
              </div>
              <div class="flex justify-end">
                <button @click="addBreakdownRange" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 active:scale-95 transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Range
                </button>
              </div>
            </div>
            
            <!-- Save Button -->
            <div class="flex justify-end pt-2">
              <button @click="savePrizeBreakdown" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm flex items-center gap-1 shadow-lg shadow-green-100 active:scale-95 transition-all" :disabled="savingBreakdown">
                <svg v-if="savingBreakdown" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ savingBreakdown ? 'Saving...' : 'Save Prize Breakdown' }}
              </button>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-900">Contest Leaderboard</h3>
              <button @click="fetchLeaderboard" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-bold">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Player</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-if="leaderboard.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic">No participants in this contest yet.</td>
                  </tr>
                  <tr v-for="entry in leaderboard" :key="entry._id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-black" :class="entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : entry.rank === 2 ? 'bg-gray-100 text-gray-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'">
                        #{{ entry.rank }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {{ (entry.userId?.displayName || 'U')[0] }}
                        </div>
                        <div>
                          <div class="text-sm font-bold text-gray-900">{{ entry.userId?.displayName || 'Unknown User' }}</div>
                          <div class="text-[10px] text-gray-400 font-mono">{{ entry.userId?._id || 'ID N/A' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">{{ entry.points }} pts</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button
                        v-if="!entry.paid"
                        @click="markPaid(entry.userId?._id || entry.userId)"
                        class="px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                      >
                        Mark Paid
                      </button>
                      <span v-else class="px-3 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-100">Verified</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden p-12 border border-gray-100 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Select a Contest</h3>
          <p class="text-gray-500 max-w-xs">Choose a contest from the list on the left to manage participants and leaderboard.</p>
        </div>
      </div>
    </div>

    <!-- Update Points Dialog -->
    <div v-if="showPointsDialog" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col border border-gray-100">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Update Player Points</h3>
            <p class="text-sm text-gray-500">Live Match Performance</p>
          </div>
          <button @click="showPointsDialog = false" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
             <svg class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <p class="text-sm text-blue-700 leading-relaxed">Enter the current performance points for each player. Total team points (including C/VC multipliers) will be calculated automatically.</p>
          </div>

          <div class="space-y-4">
            <div v-for="player in matchPlayers" :key="player.id" class="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                  {{ (player.name || 'P')[0] }}
                </div>
                <span class="text-sm font-semibold text-gray-800">{{ player.name || player._id }}</span>
              </div>
              <div class="relative">
                <input 
                  v-model.number="pointsForm[player._id || player.id]" 
                  type="number" 
                  class="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:border-gray-300" 
                  placeholder="0"
                >
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 rounded-b-2xl">
          <button @click="showPointsDialog = false" class="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-all">Cancel</button>
          <button 
            @click="submitPoints" 
            class="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2" 
            :disabled="updatingPoints"
          >
            <svg v-if="updatingPoints" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ updatingPoints ? 'Saving...' : 'Save Points' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMatches } from '~/composables/matches/useMatches'
import { useToast } from '~/composables/common/useToast'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const { success, error } = useToast()
const matchId = computed(() => {
  const params = route.params as { id: string | string[] }
  return Array.isArray(params.id) ? params.id[0] : String(params.id)
})

const { matches, selectedMatch } = useMatches()
const matchPlayers = ref<any[]>([])

const loading = ref(true)
const contests = ref<any[]>([])
const selectedContest = ref<any>(null)
const selectedContestId = computed(() => selectedContest.value?._id || selectedContest.value?.id)
const leaderboard = ref<any[]>([])

const newRange = ref({
  fromRank: 1,
  toRank: 1,
  prizeAmount: 100
})
const savingBreakdown = ref(false)

const addBreakdownRange = () => {
  if (!selectedContest.value) return
  if (!newRange.value.fromRank || !newRange.value.toRank || !newRange.value.prizeAmount) {
    return alert('Please enter valid rank range and prize amount')
  }
  
  if (!selectedContest.value.prizeBreakdown) {
    selectedContest.value.prizeBreakdown = []
  }
  
  selectedContest.value.prizeBreakdown.push({
    fromRank: newRange.value.fromRank,
    toRank: newRange.value.toRank,
    prizeAmount: newRange.value.prizeAmount
  })
  
  selectedContest.value.prizeBreakdown.sort((a: any, b: any) => a.fromRank - b.fromRank)
  
  newRange.value = {
    fromRank: newRange.value.toRank + 1,
    toRank: newRange.value.toRank + 1,
    prizeAmount: 100
  }
}

const deleteBreakdownRange = (idx: number) => {
  if (!selectedContest.value || !selectedContest.value.prizeBreakdown) return
  selectedContest.value.prizeBreakdown.splice(idx, 1)
}

const savePrizeBreakdown = async () => {
  if (!selectedContest.value) return
  try {
    savingBreakdown.value = true
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body: { prizeBreakdown: selectedContest.value.prizeBreakdown || [] }
    })
    
    if (res.success && res.data) {
      selectedContest.value.prizeBreakdown = res.data.prizeBreakdown
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) contests.value[idx].prizeBreakdown = res.data.prizeBreakdown
      success('Prize distribution updated successfully!')
    }
  } catch (e: any) {
    error('Failed to save prize breakdown')
  } finally {
    savingBreakdown.value = false
  }
}

const updateLimit = async () => {
  if (!selectedContest.value) return
  try {
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body: { participantLimit: selectedContest.value.participantLimit || 100 }
    })
    if (res.success && res.data) {
      selectedContest.value.participantLimit = res.data.participantLimit
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) contests.value[idx].participantLimit = res.data.participantLimit
      success('Participant limit updated!')
    }
  } catch (e) {
    error('Failed to update limit')
  }
}

const updateEntryFee = async () => {
  if (!selectedContest.value) return
  try {
    const fee = Number(selectedContest.value.entryFee) || 0
    const body: any = { entryFee: fee }
    if (fee === 0) {
      body.originalEntryFee = 0
    }
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body
    })
    if (res.success && res.data) {
      selectedContest.value.entryFee = res.data.entryFee
      selectedContest.value.originalEntryFee = res.data.originalEntryFee
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) {
        contests.value[idx].entryFee = res.data.entryFee
        contests.value[idx].originalEntryFee = res.data.originalEntryFee
      }
      success('Entry fee updated!')
    }
  } catch (e) {
    error('Failed to update entry fee')
  }
}

const makeContestFree = async () => {
  if (!selectedContest.value) return
  try {
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body: { entryFee: 0 }
    })
    if (res.success && res.data) {
      selectedContest.value.entryFee = res.data.entryFee
      selectedContest.value.originalEntryFee = res.data.originalEntryFee
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) {
        contests.value[idx].entryFee = res.data.entryFee
        contests.value[idx].originalEntryFee = res.data.originalEntryFee
      }
      success('Contest is now free!')
    }
  } catch (e) {
    error('Failed to make contest free')
  }
}

const restoreContestPrice = async () => {
  if (!selectedContest.value || !selectedContest.value.originalEntryFee) return
  try {
    const originalPrice = selectedContest.value.originalEntryFee
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body: { entryFee: originalPrice }
    })
    if (res.success && res.data) {
      selectedContest.value.entryFee = res.data.entryFee
      selectedContest.value.originalEntryFee = res.data.originalEntryFee
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) {
        contests.value[idx].entryFee = res.data.entryFee
        contests.value[idx].originalEntryFee = res.data.originalEntryFee
      }
      success('Original entry fee restored!')
    }
  } catch (e) {
    error('Failed to restore entry fee')
  }
}

const form = ref({
  name: '',
  firstPrize: 1000,
  entryFee: 100,
  participantLimit: 100,
  isLocked: false
})
const creating = ref(false)

const showPointsDialog = ref(false)
const pointsForm = ref<Record<string, number>>({})
const updatingPoints = ref(false)
const updatingLock = ref(false)
const deleting = ref(false)

const toggleLock = async () => {
  if (!selectedContest.value) return
  try {
    updatingLock.value = true
    const newStatus = !selectedContest.value.isLocked
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}`, {
      method: 'PATCH',
      body: { isLocked: newStatus }
    })
    
    if (res.success && res.data) {
      const updatedContest = res.data
      selectedContest.value.isLocked = updatedContest.isLocked
      
      // Update in list too
      const idx = contests.value.findIndex(c => (c._id || c.id) === selectedContestId.value)
      if (idx !== -1) contests.value[idx].isLocked = updatedContest.isLocked
      
      success(newStatus ? 'Contest locked as Coming Soon' : 'Contest unlocked')
    }
  } catch (e: any) {
    error('Failed to update lock status')
  } finally {
    updatingLock.value = false
  }
}

const selectContest = async (c: any) => {
  selectedContest.value = c
  leaderboard.value = []
  await fetchLeaderboard()
}

const deleteContest = async () => {
  if (!selectedContest.value) return
  if (!confirm('Are you sure you want to delete this contest? All entries and points will be lost.')) return
  try {
    deleting.value = true
    await $fetch(`/api/contests/${selectedContestId.value}`, {
      method: 'DELETE'
    })
    contests.value = contests.value.filter(c => (c._id || c.id) !== selectedContestId.value)
    selectedContest.value = null
    leaderboard.value = []
    success('Contest deleted successfully')
  } catch (e: any) {
    error('Failed to delete contest')
  } finally {
    deleting.value = false
  }
}

const fetchContests = async () => {
  try {
    loading.value = true
    const res = await $fetch<any>(`/api/contests?matchId=${matchId.value}`)
    contests.value = res.data || []
    if (contests.value.length > 0 && !selectedContest.value) {
      selectedContest.value = contests.value[0]
      await fetchLeaderboard()
    }
  } catch (e: any) {
    console.error('Error fetching contests:', e)
  } finally {
    loading.value = false
  }
}

const fetchLeaderboard = async () => {
  if (!selectedContest.value) return
  try {
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}/leaderboard`)
    leaderboard.value = res.data || []
  } catch (e) {
    console.error('Error fetching leaderboard:', e)
  }
}

const createContest = async () => {
  if (!form.value.name) return alert('Name required')
  try {
    creating.value = true
    const res = await $fetch<any>('/api/contests', {
      method: 'POST',
      body: {
        matchId: matchId.value,
        name: form.value.name,
        firstPrize: form.value.firstPrize,
        entryFee: form.value.entryFee,
        participantLimit: form.value.participantLimit,
        isLocked: form.value.isLocked
      }
    })
    contests.value.push(res.data)
    selectedContest.value = res.data
    await fetchLeaderboard()
    success('Contest created successfully!')
    form.value.name = '' // Reset
  } catch (e: any) {
    error(e.statusMessage || e.message || 'Failed to create contest')
  } finally {
    creating.value = false
  }
}

const markPaid = async (userId: string) => {
  if (!selectedContest.value) return
  try {
    await $fetch(`/api/contests/${selectedContestId.value}/pay`, {
      method: 'POST',
      body: { userId, paid: true }
    })
    const entry = leaderboard.value.find(e => (e.userId?._id || e.userId) === userId)
    if (entry) entry.paid = true
    success('Marked as paid')
  } catch (e: any) {
    error('Failed to mark paid')
  }
}

const extractPlayers = () => {
  if (selectedMatch.value?.players) {
    const p = [
      ...(selectedMatch.value.players.teamA || []),
      ...(selectedMatch.value.players.teamB || [])
    ]
    matchPlayers.value = p.map((id: any) => typeof id === 'object' ? id : { id, name: id })
    // Init form with saved points if available
    const savedPoints = selectedMatch.value?.playerPoints || {}
    matchPlayers.value.forEach(player => {
      const pId = player._id || player.id
      pointsForm.value[pId] = savedPoints[pId] ?? 0
    })
  }
}

// In case the store doesn't have the match loaded if they navigated directly
const ensureMatchLoaded = async () => {
  if (!selectedMatch.value || selectedMatch.value.id !== matchId.value) {
    try {
      const res = await $fetch<any>(`/api/matches/${matchId.value}`)
      if (res.data) {
        selectedMatch.value = res.data
      }
    } catch(e) {}
  }
  extractPlayers()
}

const submitPoints = async () => {
  if (!selectedContest.value) return
  try {
    updatingPoints.value = true
    await $fetch(`/api/contests/${selectedContestId.value}/points`, {
      method: 'POST',
      body: { playerPoints: pointsForm.value }
    })
    
    // Update local state
    if (selectedMatch.value) {
      selectedMatch.value.playerPoints = { ...pointsForm.value }
    }

    showPointsDialog.value = false
    await fetchLeaderboard()
    success('Points updated successfully!')
  } catch (e: any) {
    error('Failed to update points')
  } finally {
    updatingPoints.value = false
  }
}

onMounted(async () => {
  await fetchContests()
  await ensureMatchLoaded()
})
</script>
