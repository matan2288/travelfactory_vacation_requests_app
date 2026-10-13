export type VacationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VacationRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string;   // ISO format: YYYY-MM-DD
  daysCount: number;
  reason?: string | null;
  status: VacationStatus;
  comments?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Mock-only fields; the backend does not return them.
  requesterDepartment?: string;
  validatorName?: string;
  decisionDate?: string;
}

export interface CreateVacationRequestDto {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface VacationFilterParams {
  status?: VacationStatus | 'ALL';
  requesterId?: string;
  searchTerm?: string;
  page: number;
  pageSize: number;
}
