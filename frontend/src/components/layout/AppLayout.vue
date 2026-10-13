<template>
  <div class="min-h-screen bg-white flex flex-col text-slate-900">
    <AppHeader />
    <AppSidebar />

    <main class="flex-1 w-full">
      <router-view :key="$route.fullPath + (currentUser ? currentUser.id : '')" />
    </main>

    <footer class="border-t border-neutral-200/80 bg-neutral-50/50 py-6 mt-12 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span>Vacation Management System</span>
          <span aria-hidden="true">·</span>
          <span>Vue 2.7 Monorepo</span>
          <span aria-hidden="true">·</span>
          <span class="text-xs text-slate-400">{{ isMockMode ? 'Mock API Adapter Active' : 'Connected to API' }}</span>
        </div>

        <div v-if="isMockMode" class="flex items-center gap-4">
          <button
            type="button"
            class="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors cursor-pointer"
            @click="onResetData"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';
import { authService } from '@/features/auth/auth.service';
import { mockApi } from '@/mocks/mock-api';
import { isMockMode } from '@/services/api-client';

export default Vue.extend({
  name: 'AppLayout',
  components: {
    AppHeader,
    AppSidebar,
  },
  data() {
    return { isMockMode };
  },
  computed: {
    currentUser() {
      return authService.currentUser;
    },
  },
  methods: {
    onResetData() {
      if (confirm('Reset vacation requests and demo accounts back to default seed data?')) {
        mockApi.resetToDefaults();
        window.location.reload();
      }
    },
  },
});
</script>
