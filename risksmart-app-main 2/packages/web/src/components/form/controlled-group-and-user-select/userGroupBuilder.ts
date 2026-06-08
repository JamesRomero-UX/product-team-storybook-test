import type { GetUserGroupsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

const defaultUserGroup: GetUserGroupsQuery['user_group'][number] = {
  Id: 'b3d6e665-2860-456c-a499-6764230d5bf1',
  Name: 'Approval team',
  Email: 'test@test.com',
  Description: 'Approval team description',
  OwnerContributor: true,
  createdByUser: {
    FriendlyName: 'RiskManager1',
    __typename: 'user',
  },
  CreatedAtTimestamp: '2024-07-03T09:37:08.214282+00:00',
  modifiedByUser: {
    FriendlyName: 'RiskManager1',
    __typename: 'user',
  },
  ModifiedAtTimestamp: '2024-07-03T09:37:08.214282+00:00',
  users_aggregate: {
    aggregate: {
      count: 1,
      __typename: 'user_group_user_aggregate_fields',
    },
    __typename: 'user_group_user_aggregate',
  },
  __typename: 'user_group',
};
export const buildUserGroup = (
  overrides: Partial<GetUserGroupsQuery['user_group'][number]> = {}
) => ({ ...defaultUserGroup, ...overrides });
