import {
  validateVacationRequestInput,
  validateRejectionComment,
  canUserDecideRequest,
} from '../src/features/vacation-requests/vacation-requests.validation';
import type { VacationRequest } from '../src/features/vacation-requests/vacation-requests.types';
import type { User } from '../src/types/user.types';

describe('Vacation Requests Business Rules Validation', () => {
  const mockExistingRequests: VacationRequest[] = [
    {
      id: 'req-1',
      requesterId: 'user-1',
      requesterName: 'Alex Morgan',
      requesterEmail: 'alex@company.internal',
      requesterDepartment: 'Engineering',
      startDate: '2026-11-10',
      endDate: '2026-11-15',
      daysCount: 6,
      status: 'APPROVED',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'req-2',
      requesterId: 'user-1',
      requesterName: 'Alex Morgan',
      requesterEmail: 'alex@company.internal',
      requesterDepartment: 'Engineering',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      daysCount: 5,
      status: 'REJECTED',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
  ];

  test('Rule 1: Rejects when end date is not strictly after start date', () => {
    const result = validateVacationRequestInput('2026-11-20', '2026-11-20', []);
    expect(result.isValid).toBe(false);
    expect(result.errors.endDate).toBeDefined();
  });

  test('Rule 2: Detects overlapping interval with existing approved request', () => {
    // 2026-11-12 to 2026-11-18 overlaps with 2026-11-10 to 2026-11-15
    const result = validateVacationRequestInput('2026-11-12', '2026-11-18', mockExistingRequests);
    expect(result.isValid).toBe(false);
    expect(result.errors.startDate).toContain('overlaps');
  });

  test('Rule 2: Ignores rejected requests when checking overlaps', () => {
    // 2026-12-02 to 2026-12-04 overlaps with req-2 which is REJECTED
    const result = validateVacationRequestInput('2026-12-02', '2026-12-04', mockExistingRequests);
    expect(result.isValid).toBe(true);
  });

  test('Rule 4: Disallows start dates in the past', () => {
    const result = validateVacationRequestInput('2020-01-01', '2020-01-05', []);
    expect(result.isValid).toBe(false);
    expect(result.errors.startDate).toContain('past');
  });

  test('Rule 5: Enforces non-empty rejection comment', () => {
    expect(validateRejectionComment('').isValid).toBe(false);
    expect(validateRejectionComment('   ').isValid).toBe(false);
    expect(validateRejectionComment('Project milestone overlap requires rescheduling').isValid).toBe(true);
  });

  test('Rule 6: Restricts approval/rejection decisions to validators', () => {
    const requester: User = {
      id: 'u1',
      name: 'Requester',
      email: 'req@company.internal',
      role: 'REQUESTER',
      department: 'Engineering',
      totalVacationDays: 25,
      usedVacationDays: 0,
    };
    const validator: User = {
      id: 'u2',
      name: 'Validator',
      email: 'val@company.internal',
      role: 'VALIDATOR',
      department: 'People',
      totalVacationDays: 28,
      usedVacationDays: 0,
    };

    expect(canUserDecideRequest(requester)).toBe(false);
    expect(canUserDecideRequest(validator)).toBe(true);
  });
});
