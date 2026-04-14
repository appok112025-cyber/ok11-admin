<template>
  <div :class="['text-center py-8', containerClass]">
    <div
      :class="[
        'inline-block animate-spin rounded-full border-b-2',
        size === 'sm' && 'h-6 w-6 border-blue-600',
        size === 'md' && 'h-8 w-8 border-blue-600',
        size === 'lg' && 'h-12 w-12 border-blue-600',
      ]"
    ></div>
    <p v-if="message" class="mt-4 text-sm text-gray-500">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg'
    message?: string
    containerClass?: string
  }

  withDefaults(defineProps<Props>(), {
    size: 'md',
    containerClass: '',
  })
</script>
