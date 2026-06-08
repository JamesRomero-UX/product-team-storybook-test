import { randomUUID } from 'crypto';

import type { AuthUserInsertInput } from '../generated/graphql';

const defaultUser: AuthUserInsertInput = {
  UserName: 'User 1',
  RoleKey: 'RiskManager',
};

export const buildUserInsert = (
  overrides: Partial<AuthUserInsertInput> = {}
): AuthUserInsertInput => {
  return {
    ...defaultUser,
    Id: randomUUID(),
    ...overrides,
  };
};
