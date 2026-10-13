<template>
  <AppModal
    :is-open="request !== null"
    title="Vacation Request Details"
    @close="$emit('close')"
  >
    <div v-if="request" class="space-y-4">
      <RequestSummary :request="request" />

      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-slate-600 uppercase tracking-wider">Review Result</span>
        <span class="flex items-center gap-2">
          <VacationStatus :status="request.status" pill />
          <span v-if="request.status !== 'PENDING'" class="text-sm text-slate-500">· Review completed</span>
        </span>
      </div>

      <div v-if="request.comments">
        <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          {{ request.status === 'REJECTED' ? 'Rejection Note' : 'Reviewer Note' }}
        </div>
        <div class="p-4 bg-neutral-50/70 border border-neutral-200/70 rounded-xl text-sm text-slate-700 space-y-1.5">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="flex items-center gap-2 font-medium text-slate-900">
              <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Reviewed by {{ request.validatorName || 'Manager' }}
            </span>
            <span v-if="request.decisionDate" class="text-slate-500 tabular-nums">
              {{ formatDisplayDate(request.decisionDate.slice(0, 10)) }}
            </span>
          </div>
          <p class="leading-relaxed whitespace-pre-line break-words">{{ request.comments }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton variant="primary" size="sm" @click="$emit('close')">
        Close
      </AppButton>
    </template>
  </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import AppButton from '@/components/common/AppButton.vue';
import RequestSummary from './RequestSummary.vue';
import VacationStatus from './VacationStatus.vue';
import type { VacationRequest } from '../vacation-requests.types';
import { formatDisplayDate } from '@/utils/date.utils';

export default Vue.extend({
  name: 'RequestDetailsDialog',
  components: {
    AppModal,
    AppButton,
    RequestSummary,
    VacationStatus,
  },
  props: {
    request: {
      type: Object as () => VacationRequest | null,
      default: null,
    },
  },
  methods: {
    formatDisplayDate,
  },
});
</script>
