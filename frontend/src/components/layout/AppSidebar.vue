<template>
  <!-- Mobile sub-navigation bar -->
  <div class="md:hidden border-b border-neutral-200 bg-neutral-50 px-6 py-2.5 flex items-center text-xs font-medium">
    <div class="flex items-center gap-4">
      <router-link
        :to="isValidator ? '/approvals' : '/my-requests'"
        class="text-slate-600 hover:text-slate-900 py-1"
        active-class="text-slate-900 font-semibold border-b border-slate-900"
      >
        {{ isValidator ? 'Approvals' : 'My Requests' }}
      </router-link>

      <span class="h-3.5 w-px bg-neutral-300" aria-hidden="true" />

      <router-link
        to="/team-planning"
        class="text-slate-600 hover:text-slate-900 py-1"
        active-class="text-slate-900 font-semibold border-b border-slate-900"
      >
        Planning
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/features/auth/auth.service';

export default Vue.extend({
  name: 'AppSidebar',
  computed: {
    isValidator(): boolean {
      return authService.isValidator;
    },
  },
});
</script>
