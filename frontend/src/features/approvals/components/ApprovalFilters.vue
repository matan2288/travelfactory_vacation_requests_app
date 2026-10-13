<template>
  <div class="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
    <!-- Status Segmented Filter (Functional buttons with click handlers) -->
    <div class="flex items-center gap-1 p-1 bg-white border border-neutral-200/80 rounded-xl overflow-x-auto">
      <button
        type="button"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer',
          currentStatus === 'ALL'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900',
        ]"
        @click="onStatusChange('ALL')"
      >
        All Requests
      </button>

      <button
        type="button"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer',
          currentStatus === 'PENDING'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900',
        ]"
        @click="onStatusChange('PENDING')"
      >
        Pending Review
      </button>

      <button
        type="button"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer',
          currentStatus === 'APPROVED'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900',
        ]"
        @click="onStatusChange('APPROVED')"
      >
        Approved
      </button>

      <button
        type="button"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer',
          currentStatus === 'REJECTED'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900',
        ]"
        @click="onStatusChange('REJECTED')"
      >
        Rejected
      </button>
    </div>

    <!-- Requester Dropdown & Search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <!-- Requester filter -->
      <div class="flex items-center gap-2">
        <label for="requester-filter" class="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
          Requester:
        </label>
        <select
          id="requester-filter"
          :value="currentRequester"
          class="text-xs py-2 px-3 border border-neutral-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:border-slate-900"
          @change="onRequesterChange($event.target.value)"
        >
          <option value="ALL">All Team Members</option>
          <option
            v-for="user in availableUsers"
            :key="user.id"
            :value="user.id"
          >
            {{ user.name }} ({{ user.department }})
          </option>
        </select>
      </div>

      <!-- Search input -->
      <div class="relative min-w-[200px]">
        <input
          type="text"
          :value="searchTerm"
          placeholder="Filter by keyword..."
          class="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 rounded-xl focus:outline-none focus:border-slate-900 transition-colors"
          @input="onSearchInput($event.target.value)"
        />
        <svg
          class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { VacationStatus } from '@/features/vacation-requests/vacation-requests.types';
import type { User } from '@/types/user.types';
import { mockApi } from '@/mocks/mock-api';

export default Vue.extend({
  name: 'ApprovalFilters',
  props: {
    currentStatus: {
      type: String,
      default: 'ALL',
    },
    currentRequester: {
      type: String,
      default: 'ALL',
    },
    searchTerm: {
      type: String,
      default: '',
    },
  },
  computed: {
    availableUsers(): User[] {
      return mockApi.getAvailableUsers();
    },
  },
  methods: {
    onStatusChange(status: VacationStatus | 'ALL') {
      this.$emit('filter-status', status);
    },
    onRequesterChange(requesterId: string) {
      this.$emit('filter-requester', requesterId);
    },
    onSearchInput(val: string) {
      this.$emit('filter-search', val);
    },
  },
});
</script>
