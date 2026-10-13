<template>
  <div class="max-w-6xl mx-auto px-6 md:px-8 pt-8 sm:pt-12 pb-16">
    <!-- Typographic Section Label -->
    <div class="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
      02 / APPROVALS QUEUE
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Leave Approvals
        </h1>
        <p class="mt-2 text-sm text-slate-600 max-w-xl">
          Review, approve, or reject employee vacation requests with strict compliance and policy enforcement.
        </p>
      </div>
    </div>

    <!-- Feedback Banners -->
    <div
      v-if="feedbackMessage"
      :class="[
        'mb-6 p-4 rounded-xl flex items-center justify-between text-xs font-medium border',
        feedbackType === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800',
      ]"
      role="status"
    >
      <div class="flex items-center gap-2">
        <svg v-if="feedbackType === 'success'" class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ feedbackMessage }}</span>
      </div>
      <button
        type="button"
        class="p-1 hover:opacity-75 cursor-pointer"
        @click="feedbackMessage = ''"
      >
        ✕
      </button>
    </div>

    <!-- Filters -->
    <ApprovalFilters
      :current-status="filters.status || 'ALL'"
      :current-requester="filters.requesterId || 'ALL'"
      :search-term="filters.searchTerm || ''"
      @filter-status="onStatusChange"
      @filter-requester="onRequesterChange"
      @filter-search="onSearchChange"
    />

    <!-- Requests Table -->
    <AppTable
      :loading="isLoading"
      :is-empty="items.length === 0"
      :colspan="6"
    >
      <template #header>
        <th class="py-3 px-4 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Requester
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Dates
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
          Days
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Status
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
          Reason & Feedback
        </th>
        <th class="py-3 px-4 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
          Actions
        </th>
      </template>

      <template #empty>
        <div class="py-12 px-4 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-neutral-100 flex items-center justify-center text-slate-400">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="text-sm font-semibold text-slate-800 mb-1">No Vacation Requests Found</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            There are no vacation requests matching your active status and search filters.
          </p>
        </div>
      </template>

      <tr
        v-for="req in items"
        :key="req.id"
        class="hover:bg-neutral-50/70 transition-colors"
      >
        <!-- Requester -->
        <td class="py-3.5 px-4 sm:px-6 text-sm">
          <div class="font-semibold text-slate-900">
            {{ req.requesterName }}
          </div>
          <div class="text-xs text-slate-500">
            {{ req.requesterDepartment }}
          </div>
        </td>

        <!-- Dates -->
        <td class="py-3.5 px-4 text-sm font-medium text-slate-800 tabular-nums whitespace-nowrap">
          {{ formatDisplayDate(req.startDate) }} — {{ formatDisplayDate(req.endDate) }}
        </td>

        <!-- Days -->
        <td class="py-3.5 px-4 text-sm font-semibold text-slate-900 text-right tabular-nums">
          {{ req.daysCount }}
        </td>

        <!-- Status -->
        <td class="py-3.5 px-4 text-sm whitespace-nowrap">
          <VacationStatus :status="req.status" />
        </td>

        <!-- Reason & Feedback -->
        <td class="py-3.5 px-4 text-xs text-slate-600 hidden md:table-cell max-w-xs">
          <div v-if="req.reason" class="truncate text-slate-700">
            {{ req.reason }}
          </div>
          <div v-else class="text-slate-400">—</div>

          <div
            v-if="req.status === 'REJECTED' && req.validatorComment"
            class="mt-1 text-xs text-slate-500 leading-normal"
          >
            <span class="font-medium text-slate-700">Rejection note:</span> {{ req.validatorComment }}
          </div>
          <div
            v-else-if="req.status === 'APPROVED' && req.validatorComment"
            class="mt-1 text-xs text-slate-500 leading-normal"
          >
            <span class="font-medium text-slate-700">Note:</span> {{ req.validatorComment }}
          </div>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 sm:px-6 text-sm text-right whitespace-nowrap">
          <div v-if="req.status === 'PENDING'" class="inline-flex items-center gap-2">
            <AppButton
              size="sm"
              variant="primary"
              :loading="actionId === req.id && isApproving"
              :disabled="actionId !== null"
              @click="handleApprove(req)"
            >
              Approve
            </AppButton>

            <AppButton
              size="sm"
              variant="danger"
              :disabled="actionId !== null"
              @click="openRejectionDialog(req)"
            >
              Reject
            </AppButton>
          </div>

          <div v-else class="text-xs text-slate-400">
            {{ req.status === 'APPROVED' ? 'Approved' : 'Rejected' }}
          </div>
        </td>
      </tr>
    </AppTable>

    <!-- Pagination -->
    <AppPagination
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :total-pages="pagination.totalPages"
      @change-page="onPageChange"
      @change-page-size="onPageSizeChange"
    />

    <!-- Rejection Dialog -->
    <RejectionDialog
      :is-open="isRejectionDialogOpen"
      :request="targetRejectRequest"
      :is-submitting="isRejecting"
      @confirm="handleRejectConfirm"
      @cancel="closeRejectionDialog"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppTable from '@/components/common/AppTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import VacationStatus from '@/features/vacation-requests/components/VacationStatus.vue';
import ApprovalFilters from '../components/ApprovalFilters.vue';
import RejectionDialog from '../components/RejectionDialog.vue';
import { approvalsService } from '../approvals.service';
import type { VacationRequest, VacationStatus as StatusType } from '@/features/vacation-requests/vacation-requests.types';
import { formatDisplayDate } from '@/utils/date.utils';
import { getErrorMessage } from '@/utils/error.utils';

export default Vue.extend({
  name: 'ApprovalDashboardView',
  components: {
    AppTable,
    AppButton,
    AppPagination,
    VacationStatus,
    ApprovalFilters,
    RejectionDialog,
  },
  data() {
    return {
      feedbackMessage: '',
      feedbackType: 'success' as 'success' | 'error',
      isRejectionDialogOpen: false,
      targetRejectRequest: null as VacationRequest | null,
      isApproving: false,
      isRejecting: false,
      actionId: null as string | null,
    };
  },
  computed: {
    items(): VacationRequest[] {
      return approvalsService.items;
    },
    pagination() {
      return approvalsService.pagination;
    },
    filters() {
      return approvalsService.state.filters;
    },
    isLoading(): boolean {
      return approvalsService.state.isLoading;
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    formatDisplayDate,
    async loadData() {
      try {
        await approvalsService.loadRequests();
      } catch (err: unknown) {
        this.showFeedback(getErrorMessage(err), 'error');
      }
    },
    onStatusChange(status: StatusType | 'ALL') {
      approvalsService.setFilter('status', status);
      this.loadData();
    },
    onRequesterChange(requesterId: string) {
      approvalsService.setFilter('requesterId', requesterId);
      this.loadData();
    },
    onSearchChange(term: string) {
      approvalsService.setFilter('searchTerm', term);
      this.loadData();
    },
    onPageChange(page: number) {
      approvalsService.setFilter('page', page);
      this.loadData();
    },
    onPageSizeChange(size: number) {
      approvalsService.setFilter('pageSize', size);
      this.loadData();
    },
    async handleApprove(req: VacationRequest) {
      this.actionId = req.id;
      this.isApproving = true;
      try {
        await approvalsService.approve(req.id);
        this.showFeedback(`Vacation request for ${req.requesterName} was approved.`, 'success');
      } catch (err: unknown) {
        this.showFeedback(getErrorMessage(err), 'error');
      } finally {
        this.actionId = null;
        this.isApproving = false;
      }
    },
    openRejectionDialog(req: VacationRequest) {
      this.targetRejectRequest = req;
      this.isRejectionDialogOpen = true;
    },
    closeRejectionDialog() {
      this.isRejectionDialogOpen = false;
      this.targetRejectRequest = null;
    },
    async handleRejectConfirm(comment: string) {
      if (!this.targetRejectRequest) return;
      const req = this.targetRejectRequest;
      this.isRejecting = true;
      this.actionId = req.id;

      try {
        await approvalsService.reject(req.id, comment);
        this.showFeedback(`Vacation request for ${req.requesterName} was rejected with recorded comment.`, 'success');
        this.closeRejectionDialog();
      } catch (err: unknown) {
        this.showFeedback(getErrorMessage(err), 'error');
      } finally {
        this.isRejecting = false;
        this.actionId = null;
      }
    },
    showFeedback(message: string, type: 'success' | 'error') {
      this.feedbackMessage = message;
      this.feedbackType = type;
      setTimeout(() => {
        if (this.feedbackMessage === message) {
          this.feedbackMessage = '';
        }
      }, 5000);
    },
  },
});
</script>
