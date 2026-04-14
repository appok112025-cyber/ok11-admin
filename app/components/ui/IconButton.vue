<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :class="[
      'p-1 rounded transition-colors',
      variant === 'edit' && 'text-blue-600 hover:bg-blue-50',
      variant === 'delete' && 'text-red-600 hover:bg-red-50',
      variant === 'view' && 'text-green-600 hover:bg-green-50',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
    :title="title"
  >
    <svg
      v-if="variant === 'edit'"
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
    <svg
      v-else-if="variant === 'delete'"
      class="w-4 h-4"
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
    <slot />
  </button>
</template>

<script setup lang="ts">
  interface Props {
    variant: 'edit' | 'delete' | 'view'
    title?: string
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    disabled: false,
  })

  defineEmits<{
    click: []
  }>()
</script>
