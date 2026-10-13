import type { VacationRequest, VacationStatus } from '../database/entities/vacation-request.entity';
import { inclusiveDayCount } from '../shared/dates';

export interface VacationRequestDto {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: VacationStatus;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Calendar view: omits the private reason and validator comments. */
export type PlanningRequestDto = Omit<VacationRequestDto, 'reason' | 'comments'>;

/** Expects `request.user` to be loaded. */
export function toVacationRequestDto(request: VacationRequest): VacationRequestDto {
  return {
    id: request.id,
    requesterId: request.userId,
    requesterName: request.user?.name ?? '',
    requesterEmail: request.user?.email ?? '',
    startDate: request.startDate,
    endDate: request.endDate,
    daysCount: inclusiveDayCount(request.startDate, request.endDate),
    reason: request.reason,
    status: request.status,
    comments: request.comments,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export function toPlanningRequestDto(request: VacationRequest): PlanningRequestDto {
  const { reason: _reason, comments: _comments, ...rest } = toVacationRequestDto(request);
  return rest;
}
