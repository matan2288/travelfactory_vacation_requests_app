<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200/80">
    <div class="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-8">
      <!-- Zone 1: Logo mark + wordmark, routed to the role's landing page -->
      <router-link
        :to="homePath"
        class="inline-flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
      >
        <AppLogo />
        Vacation Management
      </router-link>

      <!-- Zone 2: Role-specific link, divider, shared link -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <router-link
          :to="homePath"
          class="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1"
          active-class="text-slate-900 font-semibold border-b-2 border-slate-900"
        >
          {{ isValidator ? 'Approvals' : 'My Requests' }}
        </router-link>

        <span class="h-4 w-px bg-neutral-200" aria-hidden="true" />

        <router-link
          to="/team-planning"
          class="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1"
          active-class="text-slate-900 font-semibold border-b-2 border-slate-900"
        >
          Team Planning
        </router-link>
      </nav>

      <!-- Zone 3: Sign out (identity is shown on each page via SignedInAs) -->
      <div v-if="currentUser" class="flex items-center shrink-0">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          @click="onLogout"
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import AppLogo from '@/components/common/AppLogo.vue';
import { authService } from '@/features/auth/auth.service';

export default Vue.extend({
  name: 'AppHeader',
  components: {
    AppLogo,
  },
  computed: {
    currentUser() {
      return authService.currentUser;
    },
    isValidator(): boolean {
      return authService.isValidator;
    },
    homePath(): string {
      return this.isValidator ? '/approvals' : '/my-requests';
    },
  },
  methods: {
    async onLogout() {
      await authService.logout();
      this.$router.push('/login');
    },
  },
});
</script>
