<template>
  <div
    :class="[
      'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded',
      width,
      height,
      className,
    ]"
    :style="{
      animation: 'shimmer 1.5s ease-in-out infinite',
    }"
  ></div>
</template>

<script setup lang="ts">
  interface Props {
    width?: string
    height?: string
    className?: string
  }

  withDefaults(defineProps<Props>(), {
    width: 'w-full',
    height: 'h-4',
    className: '',
  })
</script>

<style scoped>
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
</style>
