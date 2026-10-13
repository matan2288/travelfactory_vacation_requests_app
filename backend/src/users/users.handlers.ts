import { z } from 'zod';
import { guarded, type Authenticated } from '../auth/auth.guard';
import { getDataSource } from '../database/data-source';
import { User, USER_ROLES } from '../database/entities/user.entity';
import { parseWith, readQuery, type HandlerFn } from '../shared/http';
import { toUserDto, type UserDto } from './user.mapper';

const listUsersQuery = z.object({ role: z.enum(USER_ROLES).optional() });

type ListUsersInput = Authenticated<z.infer<typeof listUsersQuery>>;

export const parseListUsers = guarded(['VALIDATOR'], (event) => parseWith(listUsersQuery, readQuery(event)));

/** Validator-only list that feeds the requester filter. */
export const listUsers: HandlerFn<ListUsersInput, UserDto[]> = async ({ role }) => {
  const users = await getDataSource()
    .getRepository(User)
    .find({ where: role ? { role } : {}, order: { name: 'ASC' } });
  return users.map(toUserDto);
};
