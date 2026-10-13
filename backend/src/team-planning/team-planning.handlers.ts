import { z } from 'zod';
import { guarded } from '../auth/auth.guard';
import { getDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { daysInMonth, monthBounds } from '../shared/dates';
import { parseWith, readQuery, type HandlerFn } from '../shared/http';
import { toUserDto, type UserDto } from '../users/user.mapper';
import { toPlanningRequestDto, type PlanningRequestDto } from '../vacation-requests/vacation-request.mapper';
import { vacationRequestRepository } from '../vacation-requests/vacation-request.repository';

/** Same shape as the frontend's `TeamPlanningData`. */
export interface TeamPlanningDto {
  year: number;
  month: number;
  daysInMonth: number;
  members: { user: UserDto; requests: PlanningRequestDto[] }[];
}

const teamPlanningQuery = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const parseTeamPlanning = guarded(null, (event) => parseWith(teamPlanningQuery, readQuery(event)));

/** Monthly calendar for both roles: every user with their PENDING/APPROVED requests touching the month. */
export const teamPlanning: HandlerFn<ReturnType<typeof parseTeamPlanning>, TeamPlanningDto> = async ({ year, month }) => {
  const { start, end } = monthBounds(year, month);
  const [users, requests] = await Promise.all([
    getDataSource().getRepository(User).find({ order: { name: 'ASC' } }),
    vacationRequestRepository.listActiveInRange(start, end),
  ]);
  return {
    year,
    month,
    daysInMonth: daysInMonth(year, month),
    members: users.map((user) => ({
      user: toUserDto(user),
      requests: requests.filter((r) => r.userId === user.id).map(toPlanningRequestDto),
    })),
  };
};
