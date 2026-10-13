<template>
  <div class="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
    <!-- Status tabs -->
    <div class="flex items-center gap-1 overflow-x-auto" role="group" aria-label="Filter by status">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        type="button"
        :aria-pressed="currentStatus === option.value"
        :class="[
          'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer',
          currentStatus === option.value
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-neutral-100',
        ]"
        @click="onStatusChange(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Requester dropdown & search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="flex items-center">
        <label for="requester-filter" class="sr-only">Requester</label>
        <select
          id="requester-filter"
          :value="currentRequester"
          class="text-sm py-2 px-3 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
          @change="onRequesterChange($event.target.value)"
        >
          <option value="ALL">All Team Members</option>
          <option
            v-for="user in availableUsers"
            :key="user.id"
            :value="user.id"
          >
            {{ user.name }}<template v-if="user.department"> ({{ user.department }})</template>
          </option>
        </select>
      </div>

      <!-- Search input -->
      <div class="relative min-w-[220px]">
        <input
          type="search"
          :value="searchTerm"
          placeholder="Search Requester..."
          aria-label="Search requester"
          class="w-full pl-9 pr-3 py-2 text-sm bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 rounded-xl focus:outline-none focus:border-slate-900 shadow-2xs transition-colors placeholder:text-slate-500"
          @input="onSearchInput($event.target.value)"
        />
        <svg
          class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
import { vacationApiClient } from '@/services/api-client';

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
  data() {
    return {
      availableUsers: [] as User[],
      statusOptions: [
        { value: 'ALL', label: 'All Requests' },
        { value: 'PENDING', label: 'Pending Review' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
      ] as { value: VacationStatus | 'ALL'; label: string }[],
    };
  },
  async created() {
    try {
      this.availableUsers = await vacationApiClient.getRequesters();
    } catch {
      // The filter falls back to "All Team Members" only; the list itself still loads.
    }
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
