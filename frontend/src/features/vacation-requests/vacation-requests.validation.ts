import type { VacationRequest } from './vacation-requests.types';
import type { User } from '@/types/user.types';
import {
  isDateInPast,
  isEndDateAfterStartDate,
  doDateRangesOverlap,
} from '@/utils/date.utils';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates vacation request creation against business rules:
 * Rule 1: End date must be after start date.
 * Rule 2: Requests for the same user cannot overlap (excluding rejected requests).
 * Rule 4: Requests with past start dates are not allowed.
 *
 * NOTE: These checks provide instantaneous user feedback in the UI.
 * The future PostgreSQL/TypeORM backend must enforce each invariant independently
 * in database transactions with isolation locks.
 */
export function validateVacationRequestInput(
  startDate: string,
  endDate: string,
  existingRequests: VacationRequest[] = []
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!startDate) {
    errors.startDate = 'Start date is required.';
  } else if (isDateInPast(startDate)) {
    // Rule 4: Requests with past start dates are not allowed.
    errors.startDate = 'Vacation start date cannot be in the past.';
  }

  if (!endDate) {
    errors.endDate = 'End date is required.';
  } else if (startDate && !isEndDateAfterStartDate(startDate, endDate)) {
    // Rule 1: End date must be after start date.
    errors.endDate = 'End date must be strictly after the start date.';
  }

  // Rule 2: Requests for the same user cannot overlap (Pending or Approved)
  if (startDate && endDate && !errors.startDate && !errors.endDate) {
    const overlapping = existingRequests.find((req) => {
      if (req.status === 'REJECTED') return false;
      return doDateRangesOverlap(startDate, endDate, req.startDate, req.endDate);
    });

    if (overlapping) {
      errors.startDate = `Selected interval overlaps with an existing ${overlapping.status.toLowerCase()} request (${overlapping.startDate} to ${overlapping.endDate}).`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates request rejection.
 * Rule 5: Rejection requires a non-empty comment.
 */
export function validateRejectionComment(comment: string): { isValid: boolean; error?: string } {
  if (!comment || !comment.trim()) {
    return {
      isValid: false,
      error: 'A rejection comment is mandatory to provide clear feedback to the requester.',
    };
  }

  if (comment.trim().length < 5) {
    return {
      isValid: false,
      error: 'Rejection comment must be at least 5 characters long.',
    };
  }

  return { isValid: true };
}

/**
 * Validates authorization to approve or reject a request.
 * Rule 6: Only validators can approve or reject requests.
 */
export function canUserDecideRequest(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'VALIDATOR';
}

/**
 * Validates if a request can be modified or acted upon.
 * Rule 3: Approved requests cannot be modified.
 */
export function isRequestModifiable(request: VacationRequest): boolean {
  return request.status === 'PENDING';
}
