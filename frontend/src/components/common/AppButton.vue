<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="computedClasses"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    <slot />
  </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AppButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (val: string) => ['primary', 'outline', 'ghost', 'danger'].includes(val),
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string) => ['sm', 'md', 'lg'].includes(val),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    computedClasses(): string {
      const base =
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 cursor-pointer';

      let sizeClasses = 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm';
      if (this.size === 'sm') {
        sizeClasses = 'px-3 py-1.5 text-xs';
      } else if (this.size === 'lg') {
        sizeClasses = 'px-6 py-3 text-sm sm:text-base';
      }

      let variantClasses = '';
      if (this.variant === 'primary') {
        variantClasses =
          'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 hover:border-slate-800 shadow-sm';
      } else if (this.variant === 'outline') {
        variantClasses =
          'bg-white hover:bg-neutral-50 text-slate-900 border border-neutral-200 hover:border-neutral-300 shadow-sm';
      } else if (this.variant === 'ghost') {
        variantClasses =
          'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-neutral-100/80 border border-transparent';
      } else if (this.variant === 'danger') {
        variantClasses =
          'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300';
      }

      return `${base} ${sizeClasses} ${variantClasses}`;
    },
  },
});
</script>
