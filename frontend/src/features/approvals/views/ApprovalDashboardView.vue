<template>
  <div class="max-w-7xl mx-auto px-6 md:px-8 pt-8 sm:pt-12 pb-16">
    <SignedInAs />

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
      :colspan="7"
    >
      <template #header>
        <th class="py-3 px-4 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Requester
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Start Date
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          End Date
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Days
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Status
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">
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
          <div class="flex items-center gap-3">
            <UserAvatar :name="req.requesterName" :email="req.requesterEmail" />
            <div class="min-w-0">
              <button
                type="button"
                class="block max-w-full font-semibold text-slate-900 truncate text-left cursor-pointer hover:underline underline-offset-2"
                :aria-label="`View details of ${req.requesterName}'s request`"
                @click="detailsRequest = req"
              >
                {{ req.requesterName }}
              </button>
              <div class="text-xs text-slate-500 truncate">
                {{ req.requesterEmail }}
              </div>
            </div>
          </div>
        </td>

        <td class="py-3.5 px-4 text-sm font-medium text-slate-800 tabular-nums whitespace-nowrap">
          {{ formatDisplayDate(req.startDate) }}
        </td>

        <td class="py-3.5 px-4 text-sm font-medium text-slate-800 tabular-nums whitespace-nowrap">
          {{ formatDisplayDate(req.endDate) }}
        </td>

        <!-- Days -->
        <td class="py-3.5 px-4 text-sm font-semibold text-slate-900 tabular-nums">
          {{ req.daysCount }}
        </td>

        <!-- Status -->
        <td class="py-3.5 px-4 text-sm whitespace-nowrap">
          <VacationStatus :status="req.status" pill />
        </td>

        <!-- Reason & Feedback -->
        <td class="py-3.5 px-4 text-xs text-slate-600 hidden xl:table-cell max-w-[200px]">
          <button
            type="button"
            class="block w-full text-left cursor-pointer group"
            :aria-label="`View details of ${req.requesterName}'s request`"
            @click="detailsRequest = req"
          >
            <span class="block truncate text-slate-700 underline underline-offset-2 decoration-neutral-300 group-hover:decoration-slate-800">
              {{ req.reason || 'View details' }}
            </span>
            <span v-if="req.comments" class="block mt-1 truncate text-slate-500">
              <span class="font-medium text-slate-700">{{ req.status === 'REJECTED' ? 'Rejection note:' : 'Note:' }}</span>
              {{ req.comments }}
            </span>
          </button>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 sm:px-6 text-sm text-right whitespace-nowrap">
          <div v-if="req.status === 'PENDING'" class="inline-flex items-center gap-2">
            <AppButton
              size="sm"
              variant="primary"
              :disabled="actionId !== null"
              @click="openDecisionDialog(req, 'approve')"
            >
              Approve
            </AppButton>

            <AppButton
              size="sm"
              variant="danger"
              :disabled="actionId !== null"
              @click="openDecisionDialog(req, 'reject')"
            >
              Reject
            </AppButton>
          </div>

          <div v-else class="text-xs text-slate-400">
            {{ req.status === 'APPROVED' ? 'Review completed' : 'Rejected' }}
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

    <DecisionDialog
      :is-open="decisionRequest !== null"
      :mode="decisionMode"
      :request="decisionRequest"
      :is-submitting="isSubmitting"
      @confirm="handleDecisionConfirm"
      @cancel="closeDecisionDialog"
    />

    <RequestDetailsDialog :request="detailsRequest" @close="detailsRequest = null" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppTable from '@/components/common/AppTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import SignedInAs from '@/components/layout/SignedInAs.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import VacationStatus from '@/features/vacation-requests/components/VacationStatus.vue';
import ApprovalFilters from '../components/ApprovalFilters.vue';
import DecisionDialog from '../components/DecisionDialog.vue';
import RequestDetailsDialog from '@/features/vacation-requests/components/RequestDetailsDialog.vue';
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
    SignedInAs,
    UserAvatar,
    VacationStatus,
    ApprovalFilters,
    DecisionDialog,
    RequestDetailsDialog,
  },
  data() {
    return {
      feedbackMessage: '',
      feedbackType: 'success' as 'success' | 'error',
      decisionRequest: null as VacationRequest | null,
      decisionMode: 'approve' as 'approve' | 'reject',
      detailsRequest: null as VacationRequest | null,
      isSubmitting: false,
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
    openDecisionDialog(req: VacationRequest, mode: 'approve' | 'reject') {
      this.decisionMode = mode;
      this.decisionRequest = req;
    },
    closeDecisionDialog() {
      this.decisionRequest = null;
    },
    async handleDecisionConfirm(comment: string) {
      if (!this.decisionRequest) return;
      const req = this.decisionRequest;
      const approving = this.decisionMode === 'approve';
      this.isSubmitting = true;
      this.actionId = req.id;

      try {
        if (approving) {
          await approvalsService.approve(req.id, comment || undefined);
          this.showFeedback(`Review completed: ${req.requesterName}'s vacation request was approved.`, 'success');
        } else {
          await approvalsService.reject(req.id, comment);
          this.showFeedback(`Vacation request for ${req.requesterName} was rejected with recorded comment.`, 'success');
        }
        this.closeDecisionDialog();
      } catch (err: unknown) {
        this.showFeedback(getErrorMessage(err), 'error');
      } finally {
        this.isSubmitting = false;
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
