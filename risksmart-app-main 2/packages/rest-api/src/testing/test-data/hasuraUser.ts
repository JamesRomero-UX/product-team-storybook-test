import type { GetUserByIdQuery } from 'generated/graphql';
import { UserStatusEnum } from 'generated/graphql';

const defaultHasuraUser: GetUserByIdQuery['auth_user_by_pk'] = {
  Id: '1',
  UserName: null,
  Email: null,
  Status: UserStatusEnum.Active,
  FirstName: null,
  LastName: null,
  DisplayName: null,
  OfficeLocation: null,
  Department: null,
  JobTitle: null,
  RoleKey: null,
  organisationusers: [],
};

export const buildHasuraUser = (
  user: Partial<GetUserByIdQuery['auth_user_by_pk']> = {}
): GetUserByIdQuery['auth_user_by_pk'] => ({
  ...defaultHasuraUser,
  ...user,
});
