import alexMorgan from '@/assets/avatars/alex-morgan.svg';
import elenaRostova from '@/assets/avatars/elena-rostova.svg';
import marcusVance from '@/assets/avatars/marcus-vance.svg';
import sarahChen from '@/assets/avatars/sarah-chen.svg';

// Mock profile pictures keyed by seeded email; the backend returns no avatar URL.
const AVATARS: Record<string, string> = {
  'alex.requester@company.internal': alexMorgan,
  'elena.validator@company.internal': elenaRostova,
  'marcus.eng@company.internal': marcusVance,
  'sarah.dev@company.internal': sarahChen,
};

export const avatarFor = (email: string): string | undefined => AVATARS[email.toLowerCase()];
