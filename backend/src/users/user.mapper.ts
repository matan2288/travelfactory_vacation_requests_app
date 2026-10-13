import type { User, UserRole } from '../database/entities/user.entity';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function toUserDto(user: User): UserDto {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
