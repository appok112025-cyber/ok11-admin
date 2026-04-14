<template>
  <div :class="['text-center py-8 text-gray-500', containerClass]">
    <p v-if="message" class="text-sm">{{ message }}</p>
    <slot>
      <p v-if="!message" class="text-sm">No items found</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    message?: string
    containerClass?: string
  }

  withDefaults(defineProps<Props>(), {
    containerClass: '',
  })
</script>
