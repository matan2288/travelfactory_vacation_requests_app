export type UserRole = 'REQUESTER' | 'VALIDATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Mock-only profile fields; the backend does not return them.
  department?: string;
  avatar?: string;
  totalVacationDays?: number;
  usedVacationDays?: number;
}
