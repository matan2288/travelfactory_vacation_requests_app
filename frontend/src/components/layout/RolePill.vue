<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      isValidator
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-sky-50 text-sky-800 border-sky-200',
    ]"
  >
    <!-- Validator: shield-check; Requester: user -->
    <svg v-if="isValidator" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    {{ isValidator ? 'Validator' : 'Requester' }}
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
import type { UserRole } from '@/types/user.types';

export default Vue.extend({
  name: 'RolePill',
  props: {
    role: {
      type: String as () => UserRole,
      required: true,
    },
  },
  computed: {
    isValidator(): boolean {
      return this.role === 'VALIDATOR';
    },
  },
});
</script>
