import type { DomainEvent } from '../shared/events';

abstract class VacationRequestEvent implements DomainEvent {
  abstract readonly name: string;
  readonly occurredAt = new Date().toISOString();

  constructor(
    readonly requestId: string,
    readonly requesterId: string,
  ) {}
}

export class VacationRequestCreatedEvent extends VacationRequestEvent {
  readonly name = 'VacationRequestCreated';

  constructor(
    requestId: string,
    requesterId: string,
    readonly startDate: string,
    readonly endDate: string,
  ) {
    super(requestId, requesterId);
  }
}

export class VacationRequestApprovedEvent extends VacationRequestEvent {
  readonly name = 'VacationRequestApproved';

  constructor(
    requestId: string,
    requesterId: string,
    readonly validatorId: string,
  ) {
    super(requestId, requesterId);
  }
}

export class VacationRequestRejectedEvent extends VacationRequestEvent {
  readonly name = 'VacationRequestRejected';

  constructor(
    requestId: string,
    requesterId: string,
    readonly validatorId: string,
    readonly comment: string,
  ) {
    super(requestId, requesterId);
  }
}
