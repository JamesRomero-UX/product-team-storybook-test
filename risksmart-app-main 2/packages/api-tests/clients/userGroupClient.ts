import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { UserGroupInsertInput } from '../generated/graphql';
import {
  GetUserGroupsDocument,
  InsertUserGroupsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getUserGroups = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetUserGroupsDocument,
  });

  return data.user_group;
};

export const insertUserGroups = async (
  variables: VariablesOf<typeof InsertUserGroupsDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertUserGroupsDocument,
  });

export const insertUserGroup = async (
  userGroup: UserGroupInsertInput,
  options?: TestQueryOptions
) => insertUserGroups({ objects: [userGroup] }, options);
