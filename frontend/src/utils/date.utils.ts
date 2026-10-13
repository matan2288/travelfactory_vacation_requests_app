/**
 * Timezone-safe date utilities for YYYY-MM-DD date strings.
 * Avoids UTC vs Local off-by-one shifts by operating on year, month, and day integers.
 */

export function parseLocalDate(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 12, 0, 0); // Midday prevents daylight savings boundary shifts
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISODate(): string {
  return formatISODate(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculates inclusive calendar days between two ISO date strings (inclusive of start and end).
 */
export function calculateDaysCount(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Checks if a given date string is before today (strictly past date).
 */
export function isDateInPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = getTodayISODate();
  return dateStr < today;
}

/**
 * Verifies that the end date is on or after the start date.
 * Per recruitment rule 1: "End date must be after start date."
 */
export function isEndDateAfterStartDate(startDateStr: string, endDateStr: string): boolean {
  if (!startDateStr || !endDateStr) return false;
  return endDateStr > startDateStr;
}

/**
 * Checks if two date ranges [start1, end1] and [start2, end2] overlap.
 * Overlap condition: start1 <= end2 AND end1 >= start2
 */
export function doDateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 <= end2 && end1 >= start2;
}
