import { UserStatus } from '@risksmart-app/domain/src/types';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

const defaultUser: Partial<InferInsertModel<'user'>> = {
  FirstName: 'Test',
  LastName: 'User',
  UserName: 'Test User 1',
  RoleKey: 'RiskManager',
  JobTitle: 'Risk Manager',
  Department: 'Risk Management',
  OfficeLocation: 'Head Office',
};

export const buildUser = (
  userId: string,
  overrides?: Partial<InferInsertModel<'user'>>
): InferInsertModel<'user'> => ({
  ...defaultUser,
  Id: userId,
  Status: UserStatus.Active,
  ...overrides,
});
