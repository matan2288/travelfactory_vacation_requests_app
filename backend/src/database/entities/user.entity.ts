import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const USER_ROLES = ['REQUESTER', 'VALIDATOR'] as const;
export type UserRole = (typeof USER_ROLES)[number];

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  /** bcrypt hash — never the plain password. */
  @Column({ type: 'text', select: false })
  password: string;

  @Column({ type: 'enum', enum: USER_ROLES, enumName: 'user_role' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
