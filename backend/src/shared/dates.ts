const MS_PER_DAY = 86_400_000;

/**
 * Today as `YYYY-MM-DD` in the server's local timezone.
 * ponytail: uses the server clock/timezone, so "today" can differ from a user's by a few hours near midnight.
 * Upgrade path: accept the client's IANA timezone and compute today there.
 */
export function todayIsoDate(now = new Date()): string {
  return now.toLocaleDateString('en-CA');
}

/** Inclusive calendar-day count between two `YYYY-MM-DD` dates. */
export function inclusiveDayCount(startDate: string, endDate: string): number {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY) + 1;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthBounds(year: number, month: number): { start: string; end: string } {
  const mm = String(month).padStart(2, '0');
  return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(daysInMonth(year, month)).padStart(2, '0')}` };
}
