import type { User } from '@/types/user.types';
import type {
  VacationRequest,
  CreateVacationRequestDto,
  VacationFilterParams,
} from '@/features/vacation-requests/vacation-requests.types';
import type { PaginatedResponse } from '@/types/common.types';
import type { LoginCredentials, AuthSession } from '@/features/auth/auth.types';

export interface IAuthApi {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
}

export interface IVacationApi {
  getMyRequests(): Promise<VacationRequest[]>;
  createRequest(dto: CreateVacationRequestDto): Promise<VacationRequest>;
  getAllRequests(params: VacationFilterParams): Promise<PaginatedResponse<VacationRequest>>;
  approveRequest(id: string): Promise<VacationRequest>;
  rejectRequest(id: string, comment: string): Promise<VacationRequest>;
  getRequesters(): Promise<User[]>;
  getTeamPlanning(year: number, month: number): Promise<TeamPlanningData>;
}

export interface TeamMemberPlanning {
  user: User;
  requests: VacationRequest[];
}

export interface TeamPlanningData {
  year: number;
  month: number;
  daysInMonth: number;
  members: TeamMemberPlanning[];
}
