import type { QueryConfig } from '../db';
import { user } from './fragments/user';

export const getUserQueryConfig = {
  columns: {
    Id: true,
    FirstName: true,
    LastName: true,
    FriendlyName: true,
    Email: true,
    LastSeen: true,
  },
} as const satisfies QueryConfig<'user_view_active'>;

export const getUserListQueryConfig = getUserQueryConfig;

export const getUserByIdQueryConfig = user;

/**
 * Query configuration for users
 */
export const getUsersQueryConfig = {
  columns: {
    Id: true,
  },
  with: {
    userRoles: true,
  },
} as const satisfies QueryConfig<'user'>;
