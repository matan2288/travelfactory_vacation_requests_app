<template>
  <AppModal
    :is-open="isOpen"
    title="Reject Vacation Request"
    @close="$emit('cancel')"
  >
    <div v-if="request" class="space-y-4">
      <!-- Summary of target request -->
      <div class="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-slate-700 space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-900">{{ request.requesterName }}</span>
          <span class="text-slate-500 text-xs">{{ request.requesterDepartment || request.requesterEmail }}</span>
        </div>
        <div class="tabular-nums font-medium text-slate-800">
          {{ formatDisplayDate(request.startDate) }} — {{ formatDisplayDate(request.endDate) }} ({{ request.daysCount }} days)
        </div>
        <div v-if="request.reason" class="text-slate-500 italic">
          "{{ request.reason }}"
        </div>
      </div>

      <!-- Mandatory comment input -->
      <div>
        <label for="rejection-comment" class="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
          Mandatory Rejection Comment <span class="text-red-500">*</span>
        </label>
        <textarea
          id="rejection-comment"
          v-model="comment"
          rows="3"
          placeholder="Specify the reason for rejection (e.g. key project deliverable, staffing coverage, sprint freeze)..."
          class="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-slate-400"
          @input="validateComment"
        />
        <div class="flex items-center justify-between mt-1 text-xs">
          <span v-if="error" class="text-red-600 font-medium" role="alert">
            {{ error }}
          </span>
          <span v-else class="text-slate-400">
            A clear explanation is required per company leave policy.
          </span>
          <span class="text-slate-400 font-medium tabular-nums">
            {{ comment.trim().length }} characters
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton
        variant="ghost"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        Cancel
      </AppButton>

      <AppButton
        variant="danger"
        :loading="isSubmitting"
        :disabled="isSubmitting || !comment.trim()"
        @click="handleConfirm"
      >
        Confirm Rejection
      </AppButton>
    </template>
  </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import AppButton from '@/components/common/AppButton.vue';
import type { VacationRequest } from '@/features/vacation-requests/vacation-requests.types';
import { validateRejectionComment } from '@/features/vacation-requests/vacation-requests.validation';
import { formatDisplayDate } from '@/utils/date.utils';

export default Vue.extend({
  name: 'RejectionDialog',
  components: {
    AppModal,
    AppButton,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    request: {
      type: Object as () => VacationRequest | null,
      default: null,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      comment: '',
      error: '',
    };
  },
  watch: {
    isOpen(val: boolean) {
      if (val) {
        this.comment = '';
        this.error = '';
      }
    },
  },
  methods: {
    formatDisplayDate,
    validateComment() {
      const res = validateRejectionComment(this.comment);
      this.error = res.error || '';
    },
    handleConfirm() {
      const res = validateRejectionComment(this.comment);
      if (!res.isValid) {
        this.error = res.error || 'A non-empty rejection comment is required.';
        return;
      }
      this.$emit('confirm', this.comment.trim());
    },
  },
});
</script>
