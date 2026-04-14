<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[100] overflow-y-auto">
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="!loading && $emit('close')"
        ></div>
        <div
          class="relative flex items-center justify-center min-h-screen px-4 py-4 pointer-events-none"
        >
          <div
            :class="[
              'relative bg-white rounded-xl shadow-2xl w-full pointer-events-auto',
              maxWidth,
            ]"
          >
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                <slot name="title">{{ title }}</slot>
              </h3>
              <div>
                <slot />
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
              <slot name="actions">
                <SubmitButton
                  :loading="loading"
                  :disabled="disabled"
                  :editing="editing"
                  @click="$emit('submit')"
                />
                <CancelButton @click="$emit('close')" />
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  interface Props {
    show: boolean
    title?: string
    loading?: boolean
    disabled?: boolean
    editing?: boolean
    maxWidth?: string
  }

  withDefaults(defineProps<Props>(), {
    title: '',
    loading: false,
    disabled: false,
    editing: false,
    maxWidth: 'max-w-md',
  })

  defineEmits<{
    close: []
    submit: []
  }>()
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
</style>
