import { guarded, type Authenticated } from '../auth/auth.guard';
import { HttpResult, parseWith, readJsonBody, readQuery, type HandlerFn } from '../shared/http';
import {
  ApproveVacationRequestCommand,
  CreateVacationRequestCommand,
  handleApproveVacationRequest,
  handleCreateVacationRequest,
  handleRejectVacationRequest,
  RejectVacationRequestCommand,
} from './vacation-request.commands';
import type { VacationRequestDto } from './vacation-request.mapper';
import { getMyVacationRequests, getVacationRequests, type PaginatedResponse } from './vacation-request.queries';
import {
  createVacationRequestSchema,
  listVacationRequestsSchema,
  rejectVacationRequestSchema,
  requestIdSchema,
} from './vacation-request.schemas';

export const parseCreate = guarded(['REQUESTER'], (event) => ({
  body: parseWith(createVacationRequestSchema, readJsonBody(event)),
}));

export const create: HandlerFn<ReturnType<typeof parseCreate>, HttpResult<VacationRequestDto>> = async ({ auth, body }) =>
  new HttpResult(
    201,
    await handleCreateVacationRequest(new CreateVacationRequestCommand(auth.userId, body.startDate, body.endDate, body.reason)),
  );

export const parseListMine = guarded(['REQUESTER']);

export const listMine: HandlerFn<Authenticated, VacationRequestDto[]> = ({ auth }) => getMyVacationRequests(auth.userId);

export const parseList = guarded(['VALIDATOR'], (event) => ({
  query: parseWith(listVacationRequestsSchema, readQuery(event)),
}));

export const list: HandlerFn<ReturnType<typeof parseList>, PaginatedResponse<VacationRequestDto>> = ({ query }) =>
  getVacationRequests(query);

export const parseApprove = guarded(['VALIDATOR'], (event) => parseWith(requestIdSchema, event.pathParameters));

export const approve: HandlerFn<ReturnType<typeof parseApprove>, VacationRequestDto> = ({ auth, id }) =>
  handleApproveVacationRequest(new ApproveVacationRequestCommand(id, auth.userId));

export const parseReject = guarded(['VALIDATOR'], (event) => ({
  ...parseWith(requestIdSchema, event.pathParameters),
  ...parseWith(rejectVacationRequestSchema, readJsonBody(event)),
}));

export const reject: HandlerFn<ReturnType<typeof parseReject>, VacationRequestDto> = ({ auth, id, comment }) =>
  handleRejectVacationRequest(new RejectVacationRequestCommand(id, auth.userId, comment));
