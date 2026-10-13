import Vue from 'vue';
import type {
  VacationRequest,
  VacationFilterParams,
} from '@/features/vacation-requests/vacation-requests.types';
import type { PaginatedResponse } from '@/types/common.types';
import { vacationApiClient } from '@/services/api-client';

interface ApprovalsState {
  data: PaginatedResponse<VacationRequest>;
  filters: VacationFilterParams;
  isLoading: boolean;
  actionInProgressId: string | null;
  error: string | null;
}

const state: ApprovalsState = Vue.observable({
  data: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
  filters: {
    status: 'ALL',
    requesterId: 'ALL',
    searchTerm: '',
    page: 1,
    pageSize: 10,
  },
  isLoading: false,
  actionInProgressId: null,
  error: null,
});

export const approvalsService = {
  get state(): Readonly<ApprovalsState> {
    return state;
  },

  get items(): VacationRequest[] {
    return state.data.items;
  },

  get pagination() {
    return {
      total: state.data.total,
      page: state.data.page,
      pageSize: state.data.pageSize,
      totalPages: state.data.totalPages,
    };
  },

  setFilter(key: keyof VacationFilterParams, value: unknown): void {
    Vue.set(state.filters, key, value);
    // Reset to page 1 on filter changes unless changing page directly
    if (key !== 'page') {
      Vue.set(state.filters, 'page', 1);
    }
  },

  async loadRequests(): Promise<void> {
    state.isLoading = true;
    state.error = null;
    try {
      const response = await vacationApiClient.getAllRequests(state.filters);
      state.data = response;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load requests';
      throw err;
    } finally {
      state.isLoading = false;
    }
  },

  async approve(id: string): Promise<VacationRequest> {
    state.actionInProgressId = id;
    state.error = null;
    try {
      const updated = await vacationApiClient.approveRequest(id);
      // Refresh list to maintain pagination and ordering
      await this.loadRequests();
      return updated;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to approve request';
      throw err;
    } finally {
      state.actionInProgressId = null;
    }
  },

  async reject(id: string, comment: string): Promise<VacationRequest> {
    state.actionInProgressId = id;
    state.error = null;
    try {
      const updated = await vacationApiClient.rejectRequest(id, comment);
      // Refresh list
      await this.loadRequests();
      return updated;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to reject request';
      throw err;
    } finally {
      state.actionInProgressId = null;
    }
  },
};
