import { toVacationRequestDto, type VacationRequestDto } from './vacation-request.mapper';
import { vacationRequestRepository as repository } from './vacation-request.repository';
import type { ListVacationRequestsQuery } from './vacation-request.schemas';

/** Same shape as the frontend's `PaginatedResponse<T>`. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getMyVacationRequests(userId: string): Promise<VacationRequestDto[]> {
  return (await repository.listByUser(userId)).map(toVacationRequestDto);
}

export async function getVacationRequests(query: ListVacationRequestsQuery): Promise<PaginatedResponse<VacationRequestDto>> {
  const [rows, total] = await repository.listPaged(query);
  return {
    items: rows.map(toVacationRequestDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}
