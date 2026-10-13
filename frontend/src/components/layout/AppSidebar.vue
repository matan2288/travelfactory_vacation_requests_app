<template>
  <!-- Mobile sub-navigation bar -->
  <div class="md:hidden border-b border-neutral-200 bg-neutral-50 px-6 py-2.5 flex items-center justify-between text-xs font-medium">
    <div class="flex items-center gap-4">
      <router-link
        to="/my-requests"
        class="text-slate-600 hover:text-slate-900 py-1"
        active-class="text-slate-900 font-semibold border-b border-slate-900"
      >
        My Requests
      </router-link>

      <router-link
        v-if="isValidator"
        to="/approvals"
        class="text-slate-600 hover:text-slate-900 py-1"
        active-class="text-slate-900 font-semibold border-b border-slate-900"
      >
        Approvals
      </router-link>

      <router-link
        to="/team-planning"
        class="text-slate-600 hover:text-slate-900 py-1"
        active-class="text-slate-900 font-semibold border-b border-slate-900"
      >
        Planning
      </router-link>
    </div>

    <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <span>{{ currentUser ? currentUser.role : '' }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/features/auth/auth.service';

export default Vue.extend({
  name: 'AppSidebar',
  computed: {
    currentUser() {
      return authService.currentUser;
    },
    isValidator() {
      return authService.isValidator;
    },
  },
});
</script>
