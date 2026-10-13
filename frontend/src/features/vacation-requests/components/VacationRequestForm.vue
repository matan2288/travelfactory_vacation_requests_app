<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Server Invariant Architectural Notice -->
    <div class="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-slate-600 leading-relaxed">
      <div class="font-semibold text-slate-800 mb-0.5">Business Rule Validation</div>
      <span>End date must be strictly after start date. Dates cannot be in the past or overlap with existing approved or pending vacations.</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AppInput
        id="vacation-start-date"
        v-model="startDate"
        label="Start Date"
        type="date"
        :min="minStartDate"
        required
        :error="errors.startDate"
        @input="validateField('startDate')"
      />

      <AppInput
        id="vacation-end-date"
        v-model="endDate"
        label="End Date"
        type="date"
        :min="startDate || minStartDate"
        required
        :error="errors.endDate"
        @input="validateField('endDate')"
      />
    </div>

    <!-- Duration calculation summary -->
    <div
      v-if="calculatedDays > 0"
      class="flex items-center justify-between px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs"
    >
      <span class="text-slate-600">Requested Leave Duration:</span>
      <span class="font-semibold text-slate-900 tabular-nums">
        {{ calculatedDays }} {{ calculatedDays === 1 ? 'day' : 'days' }}
      </span>
    </div>

    <!-- Optional reason -->
    <div>
      <label for="vacation-reason" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        Reason / Notes <span class="text-slate-400 font-normal normal-case">(optional)</span>
      </label>
      <textarea
        id="vacation-reason"
        v-model="reason"
        rows="3"
        placeholder="e.g. Annual family leave, personal wellness, conference attendance..."
        class="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-neutral-200 hover:border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
      />
    </div>

    <!-- Form level error -->
    <div v-if="submissionError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium" role="alert">
      {{ submissionError }}
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <AppButton
        type="button"
        variant="ghost"
        @click="$emit('cancel')"
      >
        Cancel
      </AppButton>

      <AppButton
        type="submit"
        variant="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting || hasErrors"
      >
        Submit Request
      </AppButton>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { vacationRequestsService } from '../vacation-requests.service';
import { validateVacationRequestInput } from '../vacation-requests.validation';
import { calculateDaysCount, getTodayISODate } from '@/utils/date.utils';
import { getErrorMessage } from '@/utils/error.utils';

export default Vue.extend({
  name: 'VacationRequestForm',
  components: {
    AppInput,
    AppButton,
  },
  data() {
    return {
      startDate: '',
      endDate: '',
      reason: '',
      errors: {
        startDate: '',
        endDate: '',
      },
      submissionError: '',
      isSubmitting: false,
    };
  },
  computed: {
    minStartDate(): string {
      return getTodayISODate();
    },
    calculatedDays(): number {
      if (!this.startDate || !this.endDate || this.endDate <= this.startDate) return 0;
      return calculateDaysCount(this.startDate, this.endDate);
    },
    hasErrors(): boolean {
      return Boolean(this.errors.startDate || this.errors.endDate);
    },
  },
  methods: {
    validateField(field: 'startDate' | 'endDate') {
      this.submissionError = '';
      if (!this.startDate && !this.endDate) return;

      const validation = validateVacationRequestInput(
        this.startDate,
        this.endDate,
        vacationRequestsService.requests
      );

      this.errors.startDate = validation.errors.startDate || '';
      this.errors.endDate = validation.errors.endDate || '';
    },
    async handleSubmit() {
      this.submissionError = '';
      const validation = validateVacationRequestInput(
        this.startDate,
        this.endDate,
        vacationRequestsService.requests
      );

      this.errors.startDate = validation.errors.startDate || '';
      this.errors.endDate = validation.errors.endDate || '';

      if (!validation.isValid) {
        return;
      }

      this.isSubmitting = true;
      try {
        const created = await vacationRequestsService.submitRequest({
          startDate: this.startDate,
          endDate: this.endDate,
          reason: this.reason.trim() || undefined,
        });

        this.$emit('created', created);
        this.startDate = '';
        this.endDate = '';
        this.reason = '';
      } catch (err: unknown) {
        this.submissionError = getErrorMessage(err);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
</script>
