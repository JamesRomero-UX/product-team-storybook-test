import type { GetUsersQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export type User = GetUsersQuery['user'][number];

const defaultUser: User = {
  FriendlyName: 'john.doe',
  Id: '123',
  Status: 'active',
  RoleKey: '',
  JobTitle: null,
  Department: null,
  OfficeLocation: null,
  Email: null,
  LastSeen: null,
  IsCustomerSupport: false,
};
export const buildUser = (overrides: Partial<User> = {}) => ({
  ...defaultUser,
  ...overrides,
});
