<template>
  <div class="space-y-6">
    <!-- View 1: Contest Dashboard Overview -->
    <div v-if="!selectedContest" class="space-y-6">
      <PageHeader
        title="Match Contests"
        description="Create and manage multiple contests for this match"
        :show-mobile-menu="false"
        :show-back-button="true"
        @back="router.push('/matches')" 
      >
        <template #actions>
          <button 
            @click="openCreateModal" 
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Create Contest
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div v-for="i in 3" :key="i" class="h-28 bg-white border border-gray-150 rounded-xl p-6"></div>
      </div>

      <!-- Stats Metric Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Total Contests -->
        <div class="bg-gradient-to-br from-indigo-50 to-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl p-6 border border-indigo-100 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Contests</div>
            <div class="text-2xl font-black text-gray-900 mt-0.5">{{ totalContestsCount }}</div>
          </div>
        </div>

        <!-- Card 2: Combined Prize Pool -->
        <div class="bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl p-6 border border-green-100 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Prize Pool</div>
            <div class="text-2xl font-black text-gray-900 mt-0.5">₹{{ totalCombinedPrizePool }}</div>
          </div>
        </div>

        <!-- Card 3: Joined Spots Progress -->
        <div class="bg-gradient-to-br from-blue-50 to-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl p-6 border border-blue-100 flex flex-col justify-center">
          <div class="flex justify-between items-center mb-2">
            <div>
              <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Combined Occupancy</div>
              <div class="text-lg font-black text-gray-900 mt-0.5">{{ totalCombinedJoined }} / {{ totalCombinedSpots }} spots</div>
            </div>
            <span class="text-sm font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{{ totalCombinedJoinedPercent }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500" :style="`width: ${totalCombinedJoinedPercent}%`"></div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div v-if="!loading" class="bg-white shadow-sm border border-gray-150 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-md">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            v-model="contestSearch"
            type="text"
            placeholder="Filter contests by name..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div class="text-xs text-gray-400 font-medium">
          Showing {{ filteredContests.length }} of {{ contests.length }} contests
        </div>
      </div>

      <!-- Contest List Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white shadow rounded-xl p-6 h-48 animate-pulse border border-gray-100"></div>
      </div>
      
      <div v-else-if="filteredContests.length === 0" class="bg-white border border-gray-150 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">No Contests Found</h3>
        <p class="text-gray-500 text-sm max-w-sm">No contests match your query. Create one above or clear the filter.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="c in filteredContests" 
          :key="c._id" 
          class="bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl border border-gray-100 flex flex-col overflow-hidden group"
        >
          <!-- Top Border Accent Decorator -->
          <div class="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex justify-between items-start gap-2">
                <h4 class="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {{ c.name }}
                </h4>
                <div class="flex gap-1 shrink-0">
                  <span v-if="c.isLocked" class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Locked</span>
                  <span class="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">{{ c.status || 'Upcoming' }}</span>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-1">ID: <span class="font-mono">{{ c._id || c.id }}</span></p>
            </div>

            <!-- Card Metrics -->
            <div class="grid grid-cols-2 gap-4 py-2 border-y border-gray-50">
              <div>
                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Prize Pool</div>
                <div class="text-base font-black text-green-600">₹{{ c.firstPrize }}</div>
              </div>
              <div>
                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Entry Fee</div>
                <div class="text-base font-black text-gray-800">{{ c.entryFee === 0 ? 'FREE' : '₹' + c.entryFee }}</div>
              </div>
            </div>

            <!-- Spot Details & Progress -->
            <div>
              <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span class="text-gray-500">Filled occupancy</span>
                <span class="text-gray-900 font-bold">{{ c.totalParticipants }} / {{ c.participantLimit }} spots</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  :style="`width: ${Math.min(Math.round(((c.totalParticipants || 0) / (c.participantLimit || 1)) * 100), 100)}%`"
                ></div>
              </div>
            </div>

            <!-- Actions Row -->
            <div class="flex gap-2 pt-2">
              <button
                @click="selectContest(c)"
                class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-extrabold text-xs uppercase tracking-wide rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
              >
                Manage Contest
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
              
              <!-- Quick Lock -->
              <button
                @click="confirmLockToggle(c)"
                :class="['p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center shrink-0', c.isLocked ? 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600']"
                title="Toggle Locked Status"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </button>

              <!-- Quick Delete -->
              <button
                @click="confirmDeleteContest(c)"
                class="p-2 text-red-500 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
                title="Delete Contest"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View 2: Detailed Workspace (Selected Contest) -->
    <div v-else class="space-y-6">
      <!-- Breadcrumb Link -->
      <div class="flex items-center gap-2">
        <button 
          @click="selectedContest = null" 
          class="inline-flex items-center gap-1 text-xs font-black text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to all contests
        </button>
      </div>

      <!-- Hero Header Card -->
      <div class="bg-white shadow-md rounded-xl overflow-hidden p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="space-y-2 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-2xl font-black text-gray-900 truncate">{{ selectedContest.name }}</h3>
            <span class="px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-black uppercase rounded-full tracking-wider">{{ selectedContest.status || 'Upcoming' }}</span>
            <span v-if="selectedContest.isLocked" class="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full tracking-wider">LOCKED</span>
          </div>
          <p class="text-sm text-gray-550 flex items-center gap-3 flex-wrap">
            <span>Prize Pool: <strong class="text-gray-900 font-bold">₹{{ selectedContest.firstPrize }}</strong></span>
            <span class="text-gray-300">|</span>
            <span>Entry: <strong class="text-gray-900 font-bold">{{ selectedContest.entryFee === 0 ? 'FREE' : '₹' + selectedContest.entryFee }}</strong></span>
            <span class="text-gray-300">|</span>
            <span>Spots: <strong class="text-gray-900 font-bold">{{ selectedContest.totalParticipants }} / {{ selectedContest.participantLimit }}</strong></span>
          </p>
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
          <button
            @click="confirmLockToggle(selectedContest)"
            :class="['flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold border rounded-lg active:scale-95 transition-all text-xs', selectedContest.isLocked ? 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100' : 'text-gray-600 border-gray-200 hover:bg-gray-50']"
            :disabled="updatingLock"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            {{ selectedContest.isLocked ? 'Unlock' : 'Lock Contest' }}
          </button>

          <button
            @click="confirmDeleteContest(selectedContest)"
            class="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-red-655 font-bold border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 transition-all text-xs"
            :disabled="deleting"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Delete
          </button>

          <button
            @click="showPointsDialog = true"
            class="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-xs"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Update Points
          </button>
        </div>
      </div>

      <!-- Responsive Multi-Column Workspace -->
      <!-- On mobile shows active tab navigation, on large screens displays side-by-side -->
      <div class="lg:hidden border-b border-gray-250 bg-white px-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'leaderboard'"
            :class="[activeTab === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500', 'whitespace-nowrap py-4 px-1 border-b-2 font-black text-sm uppercase tracking-wide transition-all focus:outline-none']"
          >
            Leaderboard & Payments
          </button>
          <button
            @click="activeTab = 'distribution'"
            :class="[activeTab === 'distribution' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500', 'whitespace-nowrap py-4 px-1 border-b-2 font-black text-sm uppercase tracking-wide transition-all focus:outline-none']"
          >
            Settings & Prizes
          </button>
        </nav>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Leaderboard & Payments -->
        <div :class="['lg:col-span-2 space-y-6', activeTab !== 'leaderboard' ? 'hidden lg:block' : '']">
          <!-- Unpaid Winners Banner -->
          <div v-if="hasUnpaidWinners" class="px-6 py-4 bg-blue-50/70 border border-blue-100 rounded-xl flex justify-between items-center gap-4 shadow-sm">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div class="text-sm font-bold text-blue-900 leading-relaxed">
                Found {{ unpaidWinnersCount }} unpaid prize winners (Total: ₹{{ unpaidWinnersTotal }})
              </div>
            </div>
            <button 
              @click="confirmSendAllPrizes" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1 shrink-0"
              :disabled="sendingAll"
            >
              <svg v-if="sendingAll" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ sendingAll ? 'Sending...' : 'Send All Prizes' }}
            </button>
          </div>

          <!-- Leaderboard Table Card -->
          <div class="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50/30">
              <h3 class="text-lg font-bold text-gray-900">Contest Leaderboard</h3>
              <div class="flex items-center gap-3">
                <div class="relative w-full sm:w-48">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    v-model="leaderboardSearch"
                    type="text"
                    placeholder="Search player..."
                    class="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button @click="fetchLeaderboard" class="flex items-center gap-1 text-blue-600 hover:text-blue-808 text-xs font-black uppercase tracking-wide shrink-0">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Refresh
                </button>
              </div>
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
                  <tr v-if="filteredLeaderboard.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic">No participants found.</td>
                  </tr>
                  <tr v-for="entry in filteredLeaderboard" :key="entry._id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-black" :class="entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : entry.rank === 2 ? 'bg-gray-100 text-gray-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'">
                        #{{ entry.rank }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
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
                      <div v-if="entry.paid">
                        <span class="px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100">Sent</span>
                      </div>
                      <div v-else-if="getPrizeForRank(entry.rank) > 0">
                        <button
                          @click="sendMoney(entry.userId?._id || entry.userId)"
                          class="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-1 font-bold"
                        >
                          Send ₹{{ getPrizeForRank(entry.rank) }}
                        </button>
                      </div>
                      <span v-else class="text-xs text-gray-400 font-medium">No Prize</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Settings & Distribution Breakdown -->
        <div :class="['space-y-6', activeTab !== 'distribution' ? 'hidden lg:block' : '']">
          <!-- Parameter Adjustments Card -->
          <div class="bg-white shadow-md rounded-xl overflow-hidden p-6 border border-gray-100 space-y-6">
            <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Contest Parameters
            </h3>
            
            <div class="space-y-4">
              <!-- Entry Fee Edit -->
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Fee</label>
                <div class="flex items-center gap-2 flex-wrap">
                  <span v-if="selectedContest.entryFee === 0 && selectedContest.originalEntryFee > 0" class="text-sm text-gray-400 line-through">₹{{ selectedContest.originalEntryFee }}</span>
                  <div class="relative flex items-center">
                    <span class="absolute left-3 text-gray-500 text-sm font-bold">₹</span>
                    <input
                      v-model.number="selectedContest.entryFee"
                      type="number"
                      @change="updateEntryFee"
                      class="w-20 pl-6 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs shadow-sm"
                    >
                  </div>
                  <span v-if="selectedContest.entryFee === 0" class="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase">FREE</span>
                  
                  <button 
                    v-if="selectedContest.entryFee > 0"
                    @click="makeContestFree"
                    class="text-[9px] bg-red-50 hover:bg-red-100 text-red-650 px-2 py-1 rounded font-black uppercase transition-all border border-red-100"
                  >
                    Make Free
                  </button>
                  <button 
                    v-else-if="selectedContest.entryFee === 0 && selectedContest.originalEntryFee > 0"
                    @click="restoreContestPrice"
                    class="text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-650 px-2 py-1 rounded font-black uppercase transition-all border border-blue-100"
                  >
                    Restore Price
                  </button>
                </div>
              </div>

              <!-- Participant Spot Limit Edit -->
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Spots Limit</label>
                <div class="flex items-center gap-2">
                  <div class="flex items-baseline gap-1 bg-white border border-gray-205 px-2.5 py-1 rounded-lg shadow-sm">
                    <span class="text-xs font-black text-blue-600">{{ selectedContest.totalParticipants }}</span>
                    <span class="text-xs text-gray-400">/</span>
                    <input
                      v-model.number="selectedContest.participantLimit"
                      type="number"
                      @change="updateLimit"
                      class="w-12 bg-transparent border-0 focus:outline-none focus:ring-0 font-bold text-gray-800 text-xs p-0"
                    >
                  </div>
                  <span class="text-[10px] text-gray-400 font-medium">max slots</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Prize Distribution Table and Form -->
          <div class="bg-white shadow-md rounded-xl overflow-hidden p-6 border border-gray-100 space-y-4">
            <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              Prize Distribution
            </h3>
            
            <div v-if="selectedContest.prizeBreakdown && selectedContest.prizeBreakdown.length > 0" class="overflow-hidden border border-gray-150 rounded-lg">
              <table class="min-w-full divide-y divide-gray-150">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Rank</th>
                    <th class="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Prize</th>
                    <th class="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="(range, idx) in selectedContest.prizeBreakdown" :key="idx" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-xs font-semibold text-gray-700">
                      {{ range.fromRank === range.toRank ? `Rank ${range.fromRank}` : `Rank ${range.fromRank} - ${range.toRank}` }}
                    </td>
                    <td class="px-3 py-2 text-xs font-bold text-green-600 text-right">
                      ₹{{ range.prizeAmount }}
                    </td>
                    <td class="px-3 py-2 text-center">
                      <button @click="deleteBreakdownRange(idx)" class="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-xs text-gray-400 italic p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No distribution configured yet.
            </div>

            <!-- Add Range form -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Range Split</div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">From</label>
                  <input v-model.number="newRange.fromRank" type="number" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="1">
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">To</label>
                  <input v-model.number="newRange.toRank" type="number" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="1">
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 font-bold uppercase mb-0.5">Prize (₹)</label>
                  <input v-model.number="newRange.prizeAmount" type="number" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="100">
                </div>
              </div>
              <div class="flex justify-end">
                <button @click="addBreakdownRange" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] uppercase flex items-center gap-1 active:scale-95 transition-all">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                  Add Range
                </button>
              </div>
            </div>
            
            <div class="flex justify-end pt-2">
              <button @click="savePrizeBreakdown" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wide rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-green-100 active:scale-95 transition-all" :disabled="savingBreakdown">
                <svg v-if="savingBreakdown" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ savingBreakdown ? 'Saving...' : 'Save Prize Breakdown' }}
              </button>
            </div>
          </div>
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
          <button @click="showPointsDialog = false" class="p-2 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-full transition-colors">
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

    <!-- Create Contest Dialog -->
    <FormDialog
      :show="showCreateDialog"
      title="Create New Contest"
      :loading="creating"
      @close="closeCreateModal"
      @submit="createContest"
    >
      <div class="space-y-4">
        <input v-model="form.name" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Contest Name">
        <input v-model="form.firstPrize" type="number" class="w-full px-3 py-2 border rounded-lg" placeholder="Prize Pool">
        <input v-model="form.entryFee" type="number" class="w-full px-3 py-2 border rounded-lg" placeholder="Entry Fee">
        <input v-model="form.participantLimit" type="number" class="w-full px-3 py-2 border rounded-lg" placeholder="Limit">
      </div>
    </FormDialog>

    <ConfirmDialog
      :show="confirmDialogState.show"
      :title="confirmDialogState.title"
      :message="confirmDialogState.message"
      :loading="confirmDialogState.loading"
      @confirm="confirmDialogState.onConfirm"
      @cancel="confirmDialogState.show = false"
    />
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
const activeTab = ref('leaderboard')
const leaderboardSearch = ref('')

const filteredLeaderboard = computed(() => {
  const query = leaderboardSearch.value.toLowerCase().trim()
  if (!query) return leaderboard.value
  return leaderboard.value.filter(entry => {
    const name = (entry.userId?.displayName || 'Unknown User').toLowerCase()
    const id = (entry.userId?._id || entry.userId || '').toLowerCase()
    return name.includes(query) || id.includes(query)
  })
})

const contestSearch = ref('')
const filteredContests = computed(() => {
  const query = contestSearch.value.toLowerCase().trim()
  if (!query) return contests.value
  return contests.value.filter(c => c.name.toLowerCase().includes(query))
})

const totalContestsCount = computed(() => contests.value.length)
const totalCombinedPrizePool = computed(() => contests.value.reduce((sum, c) => sum + (Number(c.firstPrize) || 0), 0))
const totalCombinedSpots = computed(() => contests.value.reduce((sum, c) => sum + (Number(c.participantLimit) || 0), 0))
const totalCombinedJoined = computed(() => contests.value.reduce((sum, c) => sum + (Number(c.totalParticipants) || 0), 0))
const totalCombinedJoinedPercent = computed(() => totalCombinedSpots.value > 0 ? Math.min(Math.round((totalCombinedJoined.value / totalCombinedSpots.value) * 100), 100) : 0)

const confirmDialogState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'info' | 'danger' | 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => {},
  loading: false
})

const triggerConfirm = (options: {
  title: string
  message: string
  type?: 'info' | 'danger' | 'warning'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}) => {
  confirmDialogState.value = {
    show: true,
    title: options.title,
    message: options.message,
    type: options.type || 'info',
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    onConfirm: async () => {
      confirmDialogState.value.loading = true
      try {
        await options.onConfirm()
      } finally {
        confirmDialogState.value.loading = false
        confirmDialogState.value.show = false
      }
    },
    loading: false
  }
}

const newRange = ref({
  fromRank: 1,
  toRank: 1,
  prizeAmount: 100
})
const savingBreakdown = ref(false)
const sendingAll = ref(false)

const getPrizeForRank = (rank: number) => {
  if (!selectedContest.value || !selectedContest.value.prizeBreakdown) return 0
  const range = selectedContest.value.prizeBreakdown.find((r: any) => rank >= r.fromRank && rank <= r.toRank)
  return range ? range.prizeAmount : 0
}

const unpaidWinners = computed(() => {
  return leaderboard.value.filter(entry => {
    const prize = getPrizeForRank(entry.rank)
    return prize > 0 && !entry.paid
  })
})

const hasUnpaidWinners = computed(() => unpaidWinners.value.length > 0)
const unpaidWinnersCount = computed(() => unpaidWinners.value.length)
const unpaidWinnersTotal = computed(() => {
  return unpaidWinners.value.reduce((sum, entry) => sum + getPrizeForRank(entry.rank), 0)
})

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

const deleteBreakdownRange = (idx: number | string) => {
  if (!selectedContest.value || !selectedContest.value.prizeBreakdown) return
  selectedContest.value.prizeBreakdown.splice(Number(idx), 1)
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
const showCreateDialog = ref(false)

const openCreateModal = () => {
  form.value = {
    name: '',
    firstPrize: 1000,
    entryFee: 100,
    participantLimit: 100,
    isLocked: false
  }
  showCreateDialog.value = true
}

const closeCreateModal = () => {
  showCreateDialog.value = false
}

const showPointsDialog = ref(false)
const pointsForm = ref<Record<string, number>>({})
const updatingPoints = ref(false)
const updatingLock = ref(false)
const deleting = ref(false)

const toggleLock = async (c: any) => {
  if (!c) return
  const targetId = c._id || c.id
  try {
    updatingLock.value = true
    const newStatus = !c.isLocked
    const res = await $fetch<any>(`/api/contests/${targetId}`, {
      method: 'PATCH',
      body: { isLocked: newStatus }
    })
    
    if (res.success && res.data) {
      const updatedContest = res.data
      c.isLocked = updatedContest.isLocked
      
      // Update selectedContest if matches
      if (selectedContest.value && (selectedContest.value._id === targetId || selectedContest.value.id === targetId)) {
        selectedContest.value.isLocked = updatedContest.isLocked
      }
      
      // Update in list too
      const idx = contests.value.findIndex(item => (item._id || item.id) === targetId)
      if (idx !== -1) contests.value[idx].isLocked = updatedContest.isLocked
      
      success(newStatus ? 'Contest locked as Coming Soon' : 'Contest unlocked')
    }
  } catch (e: any) {
    error('Failed to update lock status')
  } finally {
    updatingLock.value = false
  }
}

const confirmLockToggle = (c: any) => {
  const willLock = !c.isLocked
  triggerConfirm({
    title: willLock ? 'Lock Contest?' : 'Unlock Contest?',
    message: willLock 
      ? `Are you sure you want to lock "${c.name}"? Users will see it as "Coming Soon" and won't be able to join.`
      : `Are you sure you want to unlock "${c.name}"? Users will be able to join this contest.`,
    type: 'warning',
    confirmText: willLock ? 'Lock' : 'Unlock',
    onConfirm: () => toggleLock(c)
  })
}

const selectContest = async (c: any) => {
  selectedContest.value = c
  leaderboard.value = []
  await fetchLeaderboard()
}

const deleteContest = async (c: any) => {
  if (!c) return
  const targetId = c._id || c.id
  try {
    deleting.value = true
    await $fetch(`/api/contests/${targetId}`, {
      method: 'DELETE'
    })
    contests.value = contests.value.filter(item => (item._id || item.id) !== targetId)
    if (selectedContest.value && (selectedContest.value._id === targetId || selectedContest.value.id === targetId)) {
      selectedContest.value = null
    }
    leaderboard.value = []
    success('Contest deleted successfully')
  } catch (e: any) {
    error('Failed to delete contest')
  } finally {
    deleting.value = false
  }
}

const confirmDeleteContest = (c: any) => {
  triggerConfirm({
    title: 'Delete Contest?',
    message: `Are you sure you want to delete "${c.name}"? All entries and points will be lost.`,
    type: 'danger',
    confirmText: 'Delete',
    onConfirm: () => deleteContest(c)
  })
}

const fetchContests = async () => {
  try {
    loading.value = true
    const res = await $fetch<any>(`/api/contests?matchId=${matchId.value}`)
    contests.value = res.data || []
    if (selectedContest.value) {
      const updated = contests.value.find(c => (c._id || c.id) === selectedContestId.value)
      if (updated) {
        selectedContest.value = updated
      } else {
        selectedContest.value = null
      }
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
    closeCreateModal()
  } catch (e: any) {
    error(e.statusMessage || e.message || 'Failed to create contest')
  } finally {
    creating.value = false
  }
}

const sendMoney = async (userId: string) => {
  if (!selectedContest.value) return
  try {
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}/pay-prize`, {
      method: 'POST',
      body: { userId }
    })
    await fetchContests()
    await fetchLeaderboard()
    success(res.message || 'Money sent to user successfully!')
  } catch (e: any) {
    error(e.data?.message || e.message || 'Failed to send money')
  }
}

const sendAllPrizes = async () => {
  if (!selectedContest.value) return
  try {
    sendingAll.value = true
    const res = await $fetch<any>(`/api/contests/${selectedContestId.value}/pay-all-prizes`, {
      method: 'POST'
    })
    await fetchContests()
    await fetchLeaderboard()
    success(res.message || 'All prizes sent successfully!')
  } catch (e: any) {
    error(e.data?.message || e.message || 'Failed to send all prizes')
  } finally {
    sendingAll.value = false
  }
}

const confirmSendAllPrizes = () => {
  if (!selectedContest.value) return
  triggerConfirm({
    title: 'Send All Prizes?',
    message: `Are you sure you want to send prize money to all unpaid winners? This will add ₹${unpaidWinnersTotal.value} total to their user accounts and remove the distribution ranges.`,
    type: 'info',
    confirmText: 'Send All',
    onConfirm: () => sendAllPrizes()
  })
}

const extractPlayers = () => {
  if (selectedMatch.value?.players) {
    const p = [
      ...(selectedMatch.value.players.teamA || []),
      ...(selectedMatch.value.players.teamB || [])
    ]
    matchPlayers.value = p.map((id: any) => typeof id === 'object' ? id : { id, name: id })
    // Init form with saved points if available
    const savedPoints = (selectedMatch.value as any)?.playerPoints || {}
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
      (selectedMatch.value as any).playerPoints = { ...pointsForm.value }
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
