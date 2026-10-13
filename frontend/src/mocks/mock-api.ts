import type { User } from '@/types/user.types';
import type {
  VacationRequest,
  CreateVacationRequestDto,
  VacationFilterParams,
} from '@/features/vacation-requests/vacation-requests.types';
import type { PaginatedResponse } from '@/types/common.types';
import type {
  IAuthApi,
  IVacationApi,
  TeamPlanningData,
  TeamMemberPlanning,
} from '@/services/api.types';
import type { LoginCredentials, AuthSession } from '@/features/auth/auth.types';
import { SEEDED_USERS, SEEDED_REQUESTS } from './mock-data';
import { calculateDaysCount } from '@/utils/date.utils';
import {
  validateVacationRequestInput,
  validateRejectionComment,
  canUserDecideRequest,
} from '@/features/vacation-requests/vacation-requests.validation';

const STORAGE_KEY_USERS = 'vacation_mgmt_users_v1';
const STORAGE_KEY_REQUESTS = 'vacation_mgmt_requests_v1';
const STORAGE_KEY_CURRENT_USER = 'vacation_mgmt_current_user_v1';

function simulateNetworkLatency<T>(result: T, delayMs = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delayMs));
}

class MockApiService implements IAuthApi, IVacationApi {
  private users: User[] = [];
  private requests: VacationRequest[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    if (typeof window === 'undefined') {
      this.users = [...SEEDED_USERS];
      this.requests = [...SEEDED_REQUESTS];
      this.currentUser = this.users[0];
      return;
    }

    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...SEEDED_USERS];

      const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
      this.requests = storedRequests ? JSON.parse(storedRequests) : [...SEEDED_REQUESTS];

      const storedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      } else {
        // Default to first requester
        this.currentUser = this.users[0];
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
      }
    } catch {
      this.users = [...SEEDED_USERS];
      this.requests = [...SEEDED_REQUESTS];
      this.currentUser = this.users[0];
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.requests));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {
      console.warn('Failed to persist mock state to localStorage:', e);
    }
  }

  public resetToDefaults(): void {
    this.users = [...SEEDED_USERS];
    this.requests = [...SEEDED_REQUESTS];
    this.currentUser = this.users[0];
    this.saveState();
  }

  // Auth API
  public async login(credentials: LoginCredentials): Promise<AuthSession> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === credentials.email.trim().toLowerCase()
    );

    if (!user) {
      throw new Error(`No account found matching "${credentials.email}". Use one of the seeded demo accounts.`);
    }

    this.currentUser = user;
    this.saveState();

    const session: AuthSession = {
      user,
      token: `mock-jwt-token-for-${user.id}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    return simulateNetworkLatency(session);
  }

  public async getCurrentUser(): Promise<User> {
    if (!this.currentUser) {
      // Return default first requester
      this.currentUser = this.users[0];
      this.saveState();
    }
    return simulateNetworkLatency({ ...this.currentUser });
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    this.saveState();
    return simulateNetworkLatency(undefined);
  }

  public switchDemoUser(userId: string): User {
    const target = this.users.find((u) => u.id === userId);
    if (!target) throw new Error('User not found');
    this.currentUser = target;
    this.saveState();
    return { ...this.currentUser };
  }

  public async getRequesters(): Promise<User[]> {
    return simulateNetworkLatency(this.users.filter((u) => u.role === 'REQUESTER'));
  }

  // Vacation API
  public async getMyRequests(): Promise<VacationRequest[]> {
    const current = await this.getCurrentUser();
    const myReqs = this.requests
      .filter((r) => r.requesterId === current.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return simulateNetworkLatency(myReqs);
  }

  public async createRequest(dto: CreateVacationRequestDto): Promise<VacationRequest> {
    const current = await this.getCurrentUser();

    // Enforce business rules
    const existing = this.requests.filter((r) => r.requesterId === current.id);
    const validation = validateVacationRequestInput(dto.startDate, dto.endDate, existing);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Invalid vacation request parameters.';
      throw new Error(firstError);
    }

    const daysCount = calculateDaysCount(dto.startDate, dto.endDate);

    const newRequest: VacationRequest = {
      id: `req-${Date.now()}`,
      requesterId: current.id,
      requesterName: current.name,
      requesterEmail: current.email,
      requesterDepartment: current.department,
      startDate: dto.startDate,
      endDate: dto.endDate,
      daysCount,
      reason: dto.reason?.trim() || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests.unshift(newRequest);
    this.saveState();

    return simulateNetworkLatency(newRequest);
  }

  public async getAllRequests(
    params: VacationFilterParams
  ): Promise<PaginatedResponse<VacationRequest>> {
    let filtered = [...this.requests];

    if (params.status && params.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === params.status);
    }

    if (params.requesterId && params.requesterId !== 'ALL') {
      filtered = filtered.filter((r) => r.requesterId === params.requesterId);
    }

    if (params.searchTerm && params.searchTerm.trim()) {
      const term = params.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.requesterName.toLowerCase().includes(term) ||
          r.requesterDepartment?.toLowerCase().includes(term) ||
          (r.reason && r.reason.toLowerCase().includes(term))
      );
    }

    // Sort: Pending first, then by date descending
    filtered.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 10);
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return simulateNetworkLatency({
      items,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  public async approveRequest(id: string): Promise<VacationRequest> {
    const current = await this.getCurrentUser();

    // Rule 6: Only validators can approve
    if (!canUserDecideRequest(current)) {
      throw new Error('Unauthorized: Only users with the Validator role can approve vacation requests.');
    }

    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Vacation request with ID "${id}" was not found.`);
    }

    const target = this.requests[index];

    // Rule 3: Approved requests cannot be modified
    if (target.status === 'APPROVED') {
      throw new Error('This request has already been approved.');
    }

    const updated: VacationRequest = {
      ...target,
      status: 'APPROVED',
      validatorName: current.name,
      decisionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests[index] = updated;

    // Update user used vacation days count
    const userIndex = this.users.findIndex((u) => u.id === target.requesterId);
    if (userIndex !== -1) {
      this.users[userIndex].usedVacationDays = (this.users[userIndex].usedVacationDays ?? 0) + target.daysCount;
    }

    this.saveState();
    return simulateNetworkLatency(updated);
  }

  public async rejectRequest(id: string, comment: string): Promise<VacationRequest> {
    const current = await this.getCurrentUser();

    // Rule 6: Only validators can reject
    if (!canUserDecideRequest(current)) {
      throw new Error('Unauthorized: Only users with the Validator role can reject vacation requests.');
    }

    // Rule 5: Rejection requires a non-empty comment
    const commentCheck = validateRejectionComment(comment);
    if (!commentCheck.isValid) {
      throw new Error(commentCheck.error || 'A non-empty rejection comment is required.');
    }

    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Vacation request with ID "${id}" was not found.`);
    }

    const target = this.requests[index];

    // Rule 3: Approved requests cannot be modified
    if (target.status === 'APPROVED') {
      throw new Error('Approved requests cannot be modified or rejected.');
    }

    const updated: VacationRequest = {
      ...target,
      status: 'REJECTED',
      validatorName: current.name,
      comments: comment.trim(),
      decisionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests[index] = updated;
    this.saveState();
    return simulateNetworkLatency(updated);
  }

  public async getTeamPlanning(year: number, month: number): Promise<TeamPlanningData> {
    // Month is 1-indexed (1 to 12)
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const members: TeamMemberPlanning[] = this.users.map((user) => {
      // Find all requests for this user that touch this month
      const userRequests = this.requests.filter((r) => {
        if (r.requesterId !== user.id) return false;
        if (r.status === 'REJECTED') return false; // Rejected do not reserve calendar dates
        // Overlaps with month: r.startDate <= monthEnd && r.endDate >= monthStart
        return r.startDate <= monthEnd && r.endDate >= monthStart;
      });

      return {
        user,
        requests: userRequests,
      };
    });

    return simulateNetworkLatency({
      year,
      month,
      daysInMonth,
      members,
    });
  }
}

export const mockApi = new MockApiService();
