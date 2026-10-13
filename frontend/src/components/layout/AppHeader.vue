<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200/80">
    <div class="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-8">
      <!-- Zone 1: Single text element wordmark -->
      <router-link
        to="/my-requests"
        class="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
      >
        Vacation Management
      </router-link>

      <!-- Zone 2: Concise single-line navigation links -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <router-link
          to="/my-requests"
          class="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1"
          active-class="text-slate-900 font-semibold border-b-2 border-slate-900"
        >
          My Requests
        </router-link>

        <router-link
          v-if="isValidator"
          to="/approvals"
          class="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1"
          active-class="text-slate-900 font-semibold border-b-2 border-slate-900"
        >
          Approvals
        </router-link>

        <router-link
          to="/team-planning"
          class="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1"
          active-class="text-slate-900 font-semibold border-b-2 border-slate-900"
        >
          Team Planning
        </router-link>
      </nav>

      <!-- Zone 3: User Profile & Primary Action -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Quick Switch Demo Account Dropdown for test evaluators -->
        <div v-if="isMockMode" class="hidden sm:flex items-center gap-2 pr-2 border-r border-neutral-200">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Demo User:</span>
          <select
            :value="currentUser ? currentUser.id : ''"
            class="text-xs py-1 px-2 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-white text-slate-800 font-medium cursor-pointer transition-colors"
            @change="onSwitchUser($event.target.value)"
          >
            <option
              v-for="u in demoUsers"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name }} ({{ u.role }})
            </option>
          </select>
        </div>

        <div v-if="currentUser" class="flex items-center gap-2">
          <div class="text-right hidden sm:block">
            <div class="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
              {{ currentUser.name }}
            </div>
            <div class="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {{ currentUser.role }}
            </div>
          </div>

          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            @click="onLogout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService } from '@/features/auth/auth.service';
import { isMockMode } from '@/services/api-client';

export default Vue.extend({
  name: 'AppHeader',
  data() {
    return { isMockMode };
  },
  computed: {
    currentUser() {
      return authService.currentUser;
    },
    isValidator() {
      return authService.isValidator;
    },
    demoUsers() {
      return authService.seededDemoUsers;
    },
  },
  methods: {
    onSwitchUser(userId: string) {
      authService.switchDemoUser(userId);
      // If switched away from validator while on /approvals, route to /my-requests
      if (!authService.isValidator && this.$route.path === '/approvals') {
        this.$router.push('/my-requests');
      } else {
        // Emit refresh event or reload route data
        this.$emit('user-switched');
      }
    },
    async onLogout() {
      await authService.logout();
      this.$router.push('/login');
    },
  },
});
</script>
