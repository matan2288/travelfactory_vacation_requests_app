import Vue from 'vue';
import type {
  VacationRequest,
  CreateVacationRequestDto,
} from './vacation-requests.types';
import { vacationApiClient } from '@/services/api-client';
import { authService } from '@/features/auth/auth.service';

interface VacationRequestsState {
  requests: VacationRequest[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const state: VacationRequestsState = Vue.observable({
  requests: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
});

export const vacationRequestsService = {
  get state(): Readonly<VacationRequestsState> {
    return state;
  },

  get requests(): VacationRequest[] {
    return state.requests;
  },

  get pendingRequests(): VacationRequest[] {
    return state.requests.filter((r) => r.status === 'PENDING');
  },

  get approvedRequests(): VacationRequest[] {
    return state.requests.filter((r) => r.status === 'APPROVED');
  },

  get rejectedRequests(): VacationRequest[] {
    return state.requests.filter((r) => r.status === 'REJECTED');
  },

  get totalPendingDays(): number {
    return this.pendingRequests.reduce((acc, curr) => acc + curr.daysCount, 0);
  },

  get totalApprovedDays(): number {
    return this.approvedRequests.reduce((acc, curr) => acc + curr.daysCount, 0);
  },

  get totalAllocatedDays(): number {
    return authService.currentUser?.totalVacationDays || 25;
  },

  get remainingDays(): number {
    const total = this.totalAllocatedDays;
    const used = this.totalApprovedDays;
    return Math.max(0, total - used);
  },

  async loadMyRequests(): Promise<VacationRequest[]> {
    state.isLoading = true;
    state.error = null;
    try {
      const items = await vacationApiClient.getMyRequests();
      state.requests = items;
      return items;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to fetch vacation requests';
      throw err;
    } finally {
      state.isLoading = false;
    }
  },

  async submitRequest(dto: CreateVacationRequestDto): Promise<VacationRequest> {
    state.isSubmitting = true;
    state.error = null;
    try {
      const newReq = await vacationApiClient.createRequest(dto);
      state.requests.unshift(newReq);
      return newReq;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to submit request';
      throw err;
    } finally {
      state.isSubmitting = false;
    }
  },
};
