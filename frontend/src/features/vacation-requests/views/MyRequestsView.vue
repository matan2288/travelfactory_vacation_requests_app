<template>
  <div class="max-w-6xl mx-auto px-6 md:px-8 pt-8 sm:pt-12 pb-16">
    <!-- Typographic Section Label -->
    <div class="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
      01 / MY REQUESTS
    </div>

    <!-- Page Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Vacation Portal
        </h1>
        <p class="mt-2 text-sm text-slate-600 max-w-xl">
          View your annual leave allocation, track pending approvals, and schedule new vacation requests.
        </p>
      </div>

      <div class="shrink-0">
        <AppButton
          variant="primary"
          @click="isModalOpen = true"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Vacation Request
        </AppButton>
      </div>
    </div>

    <!-- KPI Summary Strip -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
      <div class="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          Annual Allowance
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
          {{ totalAllocatedDays }}
          <span class="text-xs font-normal text-slate-500">days</span>
        </div>
      </div>

      <div class="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          Approved Leave
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
          {{ totalApprovedDays }}
          <span class="text-xs font-normal text-slate-500">days</span>
        </div>
      </div>

      <div class="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          Pending Review
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
          {{ totalPendingDays }}
          <span class="text-xs font-normal text-slate-500">days</span>
        </div>
      </div>

      <div class="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          Remaining Balance
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
          {{ remainingDays }}
          <span class="text-xs font-normal text-slate-500">days</span>
        </div>
      </div>
    </div>

    <!-- Success Feedback Alert -->
    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium"
      role="status"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ successMessage }}</span>
      </div>
      <button
        type="button"
        class="text-emerald-700 hover:text-emerald-900 p-1"
        @click="successMessage = ''"
      >
        ✕
      </button>
    </div>

    <!-- Requests List Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 tracking-tight">
          Submitted Requests
        </h2>
        <span class="text-xs font-medium text-slate-400 tabular-nums">
          {{ requests.length }} {{ requests.length === 1 ? 'record' : 'records' }}
        </span>
      </div>

      <VacationRequestList
        :requests="requests"
        :loading="isLoading"
      />
    </div>

    <!-- Request Modal -->
    <AppModal
      :is-open="isModalOpen"
      title="Request Vacation Leave"
      @close="isModalOpen = false"
    >
      <VacationRequestForm
        @created="onCreated"
        @cancel="isModalOpen = false"
      />
    </AppModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppButton from '@/components/common/AppButton.vue';
import AppModal from '@/components/common/AppModal.vue';
import VacationRequestList from '../components/VacationRequestList.vue';
import VacationRequestForm from '../components/VacationRequestForm.vue';
import { vacationRequestsService } from '../vacation-requests.service';
import type { VacationRequest } from '../vacation-requests.types';

export default Vue.extend({
  name: 'MyRequestsView',
  components: {
    AppButton,
    AppModal,
    VacationRequestList,
    VacationRequestForm,
  },
  data() {
    return {
      isModalOpen: false,
      successMessage: '',
    };
  },
  computed: {
    requests(): VacationRequest[] {
      return vacationRequestsService.requests;
    },
    isLoading(): boolean {
      return vacationRequestsService.state.isLoading;
    },
    totalAllocatedDays(): number {
      return vacationRequestsService.totalAllocatedDays;
    },
    totalApprovedDays(): number {
      return vacationRequestsService.totalApprovedDays;
    },
    totalPendingDays(): number {
      return vacationRequestsService.totalPendingDays;
    },
    remainingDays(): number {
      return vacationRequestsService.remainingDays;
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        await vacationRequestsService.loadMyRequests();
      } catch (e) {
        console.error('Error loading requests:', e);
      }
    },
    onCreated(newReq: VacationRequest) {
      this.isModalOpen = false;
      this.successMessage = `Vacation request for ${newReq.daysCount} days (${newReq.startDate} to ${newReq.endDate}) submitted successfully.`;
      setTimeout(() => {
        this.successMessage = '';
      }, 6000);
    },
  },
});
</script>
