<template>
  <span :class="['inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide', statusClasses]">
    <!-- Icon for non-color-only accessibility -->
    <svg v-if="status === 'APPROVED'" class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <svg v-else-if="status === 'PENDING'" class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg v-else-if="status === 'REJECTED'" class="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>

    <span>{{ displayLabel }}</span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
import type { VacationStatus } from '../vacation-requests.types';

export default Vue.extend({
  name: 'VacationStatus',
  props: {
    status: {
      type: String as () => VacationStatus,
      required: true,
      validator: (val: string) => ['PENDING', 'APPROVED', 'REJECTED'].includes(val),
    },
  },
  computed: {
    displayLabel(): string {
      switch (this.status) {
        case 'APPROVED':
          return 'Approved';
        case 'PENDING':
          return 'Pending Review';
        case 'REJECTED':
          return 'Rejected';
        default:
          return this.status;
      }
    },
    statusClasses(): string {
      switch (this.status) {
        case 'APPROVED':
          return 'text-emerald-700';
        case 'PENDING':
          return 'text-amber-700';
        case 'REJECTED':
          return 'text-red-700';
        default:
          return 'text-slate-600';
      }
    },
  },
});
</script>
