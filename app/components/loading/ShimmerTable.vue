<template>
  <div class="space-y-3">
    <div v-for="i in rows" :key="i" class="flex items-center space-x-4">
      <Shimmer :width="'w-12'" :height="'h-12'" :className="'rounded-full'" />
      <Shimmer :width="'flex-1'" :height="'h-4'" />
      <Shimmer :width="'w-24'" :height="'h-4'" />
      <Shimmer :width="'w-20'" :height="'h-4'" />
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    rows?: number
  }

  withDefaults(defineProps<Props>(), {
    rows: 5,
  })
</script>
