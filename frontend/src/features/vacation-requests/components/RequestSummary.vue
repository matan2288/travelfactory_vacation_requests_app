<template>
  <div class="p-4 bg-white rounded-xl border border-orange-100 shadow-sm text-sm text-slate-700 space-y-2">
    <div class="flex items-center justify-between gap-3">
      <span class="flex items-center gap-2.5 min-w-0">
        <UserAvatar :name="request.requesterName" :email="request.requesterEmail" />
        <span class="text-base font-semibold text-slate-900 truncate">{{ request.requesterName }}</span>
      </span>
      <span class="text-slate-500 truncate">{{ request.requesterDepartment || request.requesterEmail }}</span>
    </div>

    <div class="flex items-center gap-2 tabular-nums text-slate-800">
      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {{ formatDisplayDate(request.startDate) }} — {{ formatDisplayDate(request.endDate) }} ({{ request.daysCount }} days)
    </div>

    <div v-if="request.reason" class="flex items-start gap-2">
      <svg class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span class="px-2 py-0.5 rounded-md bg-neutral-100 text-xs text-slate-700 whitespace-pre-line break-words">{{ request.reason }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import type { VacationRequest } from '../vacation-requests.types';
import { formatDisplayDate } from '@/utils/date.utils';

export default Vue.extend({
  name: 'RequestSummary',
  components: {
    UserAvatar,
  },
  props: {
    request: {
      type: Object as () => VacationRequest,
      required: true,
    },
  },
  methods: {
    formatDisplayDate,
  },
});
</script>
