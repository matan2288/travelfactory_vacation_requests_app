<template>
  <div class="max-w-6xl mx-auto px-6 md:px-8 pt-8 sm:pt-12 pb-16">
    <!-- Typographic Section Label -->
    <div class="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
      03 / TEAM PLANNING
    </div>

    <!-- Header & Month Controls -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Team Schedule
        </h1>
        <p class="mt-2 text-sm text-slate-600 max-w-xl">
          Overview of planned vacations across the organization to ensure staffing coverage and eliminate scheduling conflicts.
        </p>
      </div>

      <!-- Month Navigation Controls -->
      <div class="flex items-center gap-2">
        <AppButton
          size="sm"
          variant="outline"
          aria-label="Previous month"
          @click="previousMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </AppButton>

        <span class="text-sm font-bold text-slate-900 min-w-[130px] text-center tabular-nums px-2">
          {{ monthName }}
        </span>

        <AppButton
          size="sm"
          variant="outline"
          aria-label="Next month"
          @click="nextMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </AppButton>

        <AppButton
          size="sm"
          variant="ghost"
          @click="goToCurrentMonth"
        >
          Today
        </AppButton>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-6 mb-6 text-xs text-slate-600">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-sm bg-emerald-600" />
        <span class="font-medium text-slate-900">Approved Vacation</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-sm bg-amber-500" />
        <span class="font-medium text-slate-900">Pending Review</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-sm bg-neutral-100 border border-neutral-200" />
        <span>Weekend</span>
      </div>
    </div>

    <!-- Calendar Matrix Container -->
    <div class="border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
      <div v-if="isLoading" class="py-16 text-center text-slate-500">
        <div class="flex items-center justify-center gap-2 text-xs font-medium">
          <svg class="animate-spin h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading team calendar...
        </div>
      </div>

      <div v-else-if="planningData" class="overflow-x-auto">
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="bg-neutral-50/70 border-b border-neutral-200/80">
              <th class="py-3 px-4 text-left font-semibold text-slate-600 min-w-[180px] sticky left-0 bg-neutral-50/95 z-10 border-r border-neutral-200/60">
                Team Member
              </th>
              <th
                v-for="day in daysArray"
                :key="'header-' + day"
                :class="[
                  'py-2 px-1 text-center font-medium tabular-nums min-w-[28px] border-r border-neutral-100 last:border-r-0',
                  isWeekend(day) ? 'bg-neutral-100/70 text-slate-400' : 'text-slate-700',
                ]"
              >
                <div>{{ day }}</div>
                <div class="text-[9px] font-normal uppercase text-slate-400">
                  {{ getDayOfWeekLetter(day) }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="member in planningData.members"
              :key="member.user.id"
              class="hover:bg-neutral-50/40 transition-colors"
            >
              <!-- Member Name Column (Sticky) -->
              <td class="py-3 px-4 sticky left-0 bg-white/95 z-10 border-r border-neutral-200/60">
                <div class="font-semibold text-slate-900 truncate max-w-[160px]">
                  {{ member.user.name }}
                </div>
                <div v-if="member.user.department" class="text-xs text-slate-400 truncate max-w-[160px]">
                  {{ member.user.department }}
                </div>
              </td>

              <!-- Days Grid -->
              <td
                v-for="day in daysArray"
                :key="'cell-' + member.user.id + '-' + day"
                :class="[
                  'p-0.5 text-center border-r border-neutral-100 last:border-r-0 h-10 relative',
                  isWeekend(day) ? 'bg-neutral-50/60' : '',
                ]"
              >
                <div
                  v-if="getDayStatus(member.requests, day)"
                  :class="[
                    'w-full h-7 rounded-sm flex items-center justify-center text-[10px] font-semibold text-white transition-opacity cursor-help',
                    getDayStatus(member.requests, day)?.status === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-500 hover:bg-amber-600',
                  ]"
                  :title="getDayTooltip(member.requests, day)"
                >
                  <span class="sr-only">Vacation</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppButton from '@/components/common/AppButton.vue';
import { teamPlanningService } from '../team-planning.service';
import type { VacationRequest } from '@/features/vacation-requests/vacation-requests.types';

export default Vue.extend({
  name: 'TeamPlanningView',
  components: {
    AppButton,
  },
  computed: {
    planningData() {
      return teamPlanningService.data;
    },
    monthName() {
      return teamPlanningService.monthName;
    },
    isLoading() {
      return teamPlanningService.state.isLoading;
    },
    daysArray(): number[] {
      const days = this.planningData?.daysInMonth || 31;
      return Array.from({ length: days }, (_, i) => i + 1);
    },
  },
  created() {
    teamPlanningService.loadPlanning();
  },
  methods: {
    previousMonth() {
      teamPlanningService.previousMonth();
    },
    nextMonth() {
      teamPlanningService.nextMonth();
    },
    goToCurrentMonth() {
      teamPlanningService.goToCurrentMonth();
    },
    isWeekend(day: number): boolean {
      if (!this.planningData) return false;
      const date = new Date(this.planningData.year, this.planningData.month - 1, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },
    getDayOfWeekLetter(day: number): string {
      if (!this.planningData) return '';
      const date = new Date(this.planningData.year, this.planningData.month - 1, day);
      const letters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      return letters[date.getDay()];
    },
    getDayDateString(day: number): string {
      if (!this.planningData) return '';
      const m = String(this.planningData.month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${this.planningData.year}-${m}-${d}`;
    },
    getDayStatus(requests: VacationRequest[], day: number): VacationRequest | null {
      const dateStr = this.getDayDateString(day);
      return requests.find((r) => r.startDate <= dateStr && r.endDate >= dateStr) || null;
    },
    getDayTooltip(requests: VacationRequest[], day: number): string {
      const req = this.getDayStatus(requests, day);
      if (!req) return '';
      const statusText = req.status === 'APPROVED' ? 'Approved' : 'Pending Review';
      return `${req.requesterName}: ${req.startDate} to ${req.endDate} (${req.daysCount} days) - ${statusText}${req.reason ? ` - "${req.reason}"` : ''}`;
    },
  },
});
</script>
