import Vue from 'vue';
import type { TeamPlanningData } from '@/services/api.types';
import { vacationApiClient } from '@/services/api-client';

interface TeamPlanningState {
  year: number;
  month: number;
  data: TeamPlanningData | null;
  isLoading: boolean;
  error: string | null;
}

const currentDate = new Date();

const state: TeamPlanningState = Vue.observable({
  year: currentDate.getFullYear(),
  month: currentDate.getMonth() + 1, // 1-indexed
  data: null,
  isLoading: false,
  error: null,
});

export const teamPlanningService = {
  get state(): Readonly<TeamPlanningState> {
    return state;
  },

  get data(): TeamPlanningData | null {
    return state.data;
  },

  get monthName(): string {
    const d = new Date(state.year, state.month - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  },

  async loadPlanning(year?: number, month?: number): Promise<void> {
    if (year !== undefined) state.year = year;
    if (month !== undefined) state.month = month;

    state.isLoading = true;
    state.error = null;
    try {
      const result = await vacationApiClient.getTeamPlanning(state.year, state.month);
      state.data = result;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load team planning data';
      throw err;
    } finally {
      state.isLoading = false;
    }
  },

  nextMonth(): void {
    if (state.month === 12) {
      state.month = 1;
      state.year += 1;
    } else {
      state.month += 1;
    }
    this.loadPlanning();
  },

  previousMonth(): void {
    if (state.month === 1) {
      state.month = 12;
      state.year -= 1;
    } else {
      state.month -= 1;
    }
    this.loadPlanning();
  },

  goToCurrentMonth(): void {
    const now = new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth() + 1;
    this.loadPlanning();
  },
};
