<template>
  <button
    type="button"
    @click="$emit('click')"
    :disabled="disabled"
    class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
  >
    <slot>Cancel</slot>
  </button>
</template>

<script setup lang="ts">
  interface Props {
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    disabled: false,
  })

  defineEmits<{
    click: []
  }>()
</script>
