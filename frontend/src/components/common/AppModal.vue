<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      :aria-labelledby="titleId"
      aria-modal="true"
      @keydown.esc="onClose"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        @click="onClose"
      />

      <!-- Dialog Card -->
      <div
        class="relative bg-white rounded-2xl border border-neutral-200/80 shadow-xl max-w-lg w-full overflow-hidden z-10 transition-all transform"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4.5 border-b border-neutral-200/60">
          <h3 :id="titleId" class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {{ title }}
          </h3>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
            @click="onClose"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 text-sm text-slate-600">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50/60 border-t border-neutral-200/60"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';

let modalIdCounter = 0;

export default Vue.extend({
  name: 'AppModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      titleId: `modal-title-${++modalIdCounter}`,
    };
  },
  watch: {
    isOpen(val: boolean) {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
  },
  beforeDestroy() {
    document.body.style.overflow = '';
  },
  methods: {
    onClose() {
      this.$emit('close');
    },
  },
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
