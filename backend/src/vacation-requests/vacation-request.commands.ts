import { todayIsoDate } from '../shared/dates';
import { ConflictError, NotFoundError, ValidationError } from '../shared/errors';
import { eventDispatcher } from '../shared/events';
import {
  VacationRequestApprovedEvent,
  VacationRequestCreatedEvent,
  VacationRequestRejectedEvent,
} from './vacation-request.events';
import { toVacationRequestDto, type VacationRequestDto } from './vacation-request.mapper';
import { vacationRequestRepository as repository } from './vacation-request.repository';

export class CreateVacationRequestCommand {
  constructor(
    readonly userId: string,
    readonly startDate: string,
    readonly endDate: string,
    readonly reason: string | null,
  ) {}
}

export class ApproveVacationRequestCommand {
  constructor(
    readonly requestId: string,
    readonly validatorId: string,
  ) {}
}

export class RejectVacationRequestCommand {
  constructor(
    readonly requestId: string,
    readonly validatorId: string,
    readonly comment: string,
  ) {}
}

/** Enforces date rules here; the overlap rule is enforced atomically by the database. */
export async function handleCreateVacationRequest(
  command: CreateVacationRequestCommand,
  today = todayIsoDate(),
): Promise<VacationRequestDto> {
  if (command.startDate < today) {
    throw new ValidationError('Vacation start date cannot be in the past.', {
      startDate: ['Vacation start date cannot be in the past.'],
    });
  }
  if (command.endDate <= command.startDate) {
    throw new ValidationError('End date must be after the start date.', {
      endDate: ['End date must be after the start date.'],
    });
  }

  const id = await repository.insert({
    userId: command.userId,
    startDate: command.startDate,
    endDate: command.endDate,
    reason: command.reason,
  });
  const created = await loadOrFail(id);
  await eventDispatcher.publish(
    new VacationRequestCreatedEvent(created.id, created.requesterId, created.startDate, created.endDate),
  );
  return created;
}

export async function handleApproveVacationRequest(command: ApproveVacationRequestCommand): Promise<VacationRequestDto> {
  await decideOrFail(command.requestId, 'APPROVED', null);
  const approved = await loadOrFail(command.requestId);
  await eventDispatcher.publish(
    new VacationRequestApprovedEvent(approved.id, approved.requesterId, command.validatorId),
  );
  return approved;
}

export async function handleRejectVacationRequest(command: RejectVacationRequestCommand): Promise<VacationRequestDto> {
  const comment = command.comment.trim();
  if (!comment) {
    throw new ValidationError('A rejection comment is required.', { comment: ['A rejection comment is required.'] });
  }
  await decideOrFail(command.requestId, 'REJECTED', comment);
  const rejected = await loadOrFail(command.requestId);
  await eventDispatcher.publish(
    new VacationRequestRejectedEvent(rejected.id, rejected.requesterId, command.validatorId, comment),
  );
  return rejected;
}

/** Only PENDING requests can transition, so approved (and rejected) requests are immutable. */
async function decideOrFail(id: string, status: 'APPROVED' | 'REJECTED', comment: string | null): Promise<void> {
  if (await repository.decide(id, status, comment)) return;
  const existing = await repository.findById(id);
  if (!existing) throw new NotFoundError('Vacation request not found.');
  throw new ConflictError(
    'REQUEST_NOT_PENDING',
    `This request is already ${existing.status.toLowerCase()} and can no longer be changed.`,
  );
}

async function loadOrFail(id: string): Promise<VacationRequestDto> {
  const request = await repository.findByIdWithUser(id);
  if (!request) throw new NotFoundError('Vacation request not found.');
  return toVacationRequestDto(request);
}
