<template>
  <div>
    <AppTable :loading="loading" :is-empty="requests.length === 0" :colspan="5">
      <template #header>
        <th class="py-3 px-4 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Date Interval
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
          Days
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Status
        </th>
        <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
          Reason & Notes
        </th>
        <th class="py-3 px-4 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
          Submitted
        </th>
      </template>

      <template #empty>
        <div class="py-12 px-4 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-neutral-100 flex items-center justify-center text-slate-400">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 class="text-sm font-semibold text-slate-800 mb-1">No Vacation Requests Yet</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You haven't submitted any vacation requests yet. Use the "New Vacation Request" button above to schedule your time off.
          </p>
        </div>
      </template>

      <tr
        v-for="req in requests"
        :key="req.id"
        class="hover:bg-neutral-50/70 transition-colors"
      >
        <td class="py-3.5 px-4 sm:px-6 text-sm">
          <div class="font-medium text-slate-900 tabular-nums">
            {{ formatDisplayDate(req.startDate) }} — {{ formatDisplayDate(req.endDate) }}
          </div>
          <div v-if="req.status === 'APPROVED'" class="text-[11px] text-slate-400 mt-0.5">
            Locked · Approved requests cannot be modified
          </div>
        </td>

        <td class="py-3.5 px-4 text-sm text-slate-700 text-right tabular-nums font-semibold">
          {{ req.daysCount }}
        </td>

        <td class="py-3.5 px-4 text-sm align-top">
          <div class="flex items-center gap-2">
            <VacationStatus :status="req.status" />
          </div>

          <!-- Clear & Minimalist Rejection Feedback (Unboxed & Uncongested) -->
          <div
            v-if="req.status === 'REJECTED' && req.comments"
            class="mt-1.5"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
              @click="openFeedback(req)"
            >
              <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span class="underline underline-offset-2 decoration-neutral-300 group-hover:decoration-slate-800">Reviewer Note</span>
            </button>
            <p class="mt-1 text-xs text-slate-500 max-w-xs leading-normal">
              <span class="font-medium text-slate-700">Reason:</span> {{ req.comments }}
            </p>
          </div>
        </td>

        <td class="py-3.5 px-4 text-sm text-slate-600 hidden sm:table-cell max-w-xs truncate">
          {{ req.reason || '—' }}
        </td>

        <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-400 text-right tabular-nums">
          {{ formatShortDate(req.createdAt.slice(0, 10)) }}
        </td>
      </tr>
    </AppTable>

    <!-- Dedicated Rejection Feedback Modal -->
    <AppModal
      :is-open="selectedFeedback !== null"
      title="Reviewer Feedback"
      @close="selectedFeedback = null"
    >
      <div v-if="selectedFeedback" class="space-y-4">
        <div class="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-slate-700 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">Vacation Interval:</span>
            <span class="text-slate-500 tabular-nums font-medium">{{ selectedFeedback.daysCount }} days</span>
          </div>
          <div class="tabular-nums font-medium text-slate-800">
            {{ formatDisplayDate(selectedFeedback.startDate) }} — {{ formatDisplayDate(selectedFeedback.endDate) }}
          </div>
          <div v-if="selectedFeedback.reason" class="text-slate-500 italic pt-1">
            Requester reason: "{{ selectedFeedback.reason }}"
          </div>
        </div>

        <div>
          <div class="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
            Explanation from Reviewer
          </div>
          <div class="p-4 bg-neutral-50/70 border border-neutral-200/70 rounded-xl text-sm text-slate-700 leading-relaxed">
            {{ selectedFeedback.comments }}
          </div>
          <div v-if="selectedFeedback.validatorName" class="mt-2 text-xs text-slate-400">
            Decision recorded by {{ selectedFeedback.validatorName }}
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton
          variant="primary"
          size="sm"
          @click="selectedFeedback = null"
        >
          Dismiss
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppTable from '@/components/common/AppTable.vue';
import AppModal from '@/components/common/AppModal.vue';
import AppButton from '@/components/common/AppButton.vue';
import VacationStatus from './VacationStatus.vue';
import type { VacationRequest } from '../vacation-requests.types';
import { formatDisplayDate, formatShortDate } from '@/utils/date.utils';

export default Vue.extend({
  name: 'VacationRequestList',
  components: {
    AppTable,
    AppModal,
    AppButton,
    VacationStatus,
  },
  props: {
    requests: {
      type: Array as () => VacationRequest[],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedFeedback: null as VacationRequest | null,
    };
  },
  methods: {
    formatDisplayDate,
    formatShortDate,
    openFeedback(req: VacationRequest) {
      this.selectedFeedback = req;
    },
  },
});
</script>
