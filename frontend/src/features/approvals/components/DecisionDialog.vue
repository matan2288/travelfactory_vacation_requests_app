<template>
  <AppModal
    :is-open="isOpen"
    :title="isReject ? 'Reject Vacation Request' : 'Approve Vacation Request'"
    @close="$emit('cancel')"
  >
    <div v-if="request" class="space-y-4">
      <RequestSummary :request="request" />

      <div>
        <label for="decision-comment" class="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
          <template v-if="isReject">
            Mandatory Rejection Comment <span class="text-red-500">*</span>
          </template>
          <template v-else>
            Note for the requester <span class="normal-case font-normal text-slate-400">(optional)</span>
          </template>
        </label>
        <textarea
          id="decision-comment"
          v-model="comment"
          rows="3"
          maxlength="1000"
          :placeholder="isReject
            ? 'Specify the reason for rejection (e.g. key project deliverable, staffing coverage, sprint freeze)...'
            : 'Add a note for the requester (e.g. handover reminder)...'"
          :class="[
            'w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400',
            isReject ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-slate-900/10 focus:border-slate-900',
          ]"
          @input="validateComment"
        />
        <div class="flex items-center justify-between mt-1 text-xs">
          <span v-if="error" class="text-red-600 font-medium" role="alert">
            {{ error }}
          </span>
          <span v-else class="text-slate-400">
            {{ isReject ? 'A clear explanation is required per company leave policy.' : 'Approving completes the review and locks the request.' }}
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
        :variant="isReject ? 'danger' : 'primary'"
        :loading="isSubmitting"
        :disabled="isSubmitting || (isReject && !comment.trim())"
        @click="handleConfirm"
      >
        {{ isReject ? 'Confirm Rejection' : 'Confirm Approval' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import AppButton from '@/components/common/AppButton.vue';
import RequestSummary from '@/features/vacation-requests/components/RequestSummary.vue';
import type { VacationRequest } from '@/features/vacation-requests/vacation-requests.types';
import { validateRejectionComment } from '@/features/vacation-requests/vacation-requests.validation';

export default Vue.extend({
  name: 'DecisionDialog',
  components: {
    AppModal,
    AppButton,
    RequestSummary,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String as () => 'approve' | 'reject',
      default: 'reject',
      validator: (val: string) => ['approve', 'reject'].includes(val),
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
  computed: {
    isReject(): boolean {
      return this.mode === 'reject';
    },
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
    validateComment() {
      if (!this.isReject) return;
      this.error = validateRejectionComment(this.comment).error || '';
    },
    handleConfirm() {
      if (this.isReject) {
        const res = validateRejectionComment(this.comment);
        if (!res.isValid) {
          this.error = res.error || 'A non-empty rejection comment is required.';
          return;
        }
      }
      this.$emit('confirm', this.comment.trim());
    },
  },
});
</script>
