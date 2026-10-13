<template>
  <div class="w-full overflow-hidden border border-neutral-200/80 rounded-2xl bg-white shadow-2xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-neutral-200/70 bg-neutral-50/50">
            <slot name="header" />
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200/50">
          <tr v-if="loading">
            <td :colspan="colspan" class="py-12 text-center text-slate-400">
              <div class="flex items-center justify-center gap-3">
                <svg class="animate-spin h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span class="text-xs font-medium text-slate-600">Loading data...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="isEmpty">
            <td :colspan="colspan" class="py-12 text-center">
              <slot name="empty">
                <p class="text-sm text-slate-500">No records found.</p>
              </slot>
            </td>
          </tr>
          <slot v-else />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AppTable',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    colspan: {
      type: Number,
      default: 5,
    },
  },
});
</script>
