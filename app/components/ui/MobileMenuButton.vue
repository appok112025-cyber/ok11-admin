<template>
  <button
    v-if="!sidebarVisible"
    @click="toggleSidebar"
    class="lg:hidden flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    aria-label="Open menu"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
  const sidebarVisible = inject<Ref<boolean>>('sidebarVisible', ref(false))
  const toggleSidebar = inject<() => void>('toggleSidebar', () => {})
</script>
