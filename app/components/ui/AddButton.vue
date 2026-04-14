<template>
  <button
    type="button"
    @click="$emit('click')"
    :disabled="disabled"
    :class="[
      'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto',
      variant === 'primary' && 'bg-blue-600 hover:bg-blue-700',
      variant === 'success' && 'bg-green-600 hover:bg-green-700',
      variant === 'danger' && 'bg-red-600 hover:bg-red-700',
    ]"
  >
    <svg
      v-if="showIcon"
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
  interface Props {
    label?: string
    variant?: 'primary' | 'success' | 'danger'
    showIcon?: boolean
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    label: 'Add',
    variant: 'primary',
    showIcon: true,
    disabled: false,
  })

  defineEmits<{
    click: []
  }>()
</script>
