import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { OwnerGroupInsertInput } from '../generated/graphql';
import {
  DeleteOwnerGroupDocument,
  GetOwnerGroupsDocument,
  InsertOwnerGroupsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getOwnerGroups = async (options?: TestQueryOptions) => {
  const { data, errors } = await getTestClient().query({
    context: getContext(options),
    query: GetOwnerGroupsDocument,
  });
  if (errors) {
    throw errors[0];
  }

  return data.owner_group;
};

export const deleteOwnerGroup = async (
  variables: VariablesOf<typeof DeleteOwnerGroupDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteOwnerGroupDocument,
  });

export const insertOwnerGroups = async (
  variables: VariablesOf<typeof InsertOwnerGroupsDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertOwnerGroupsDocument,
  });

export const insertOwnerGroup = async (
  owner: OwnerGroupInsertInput,
  options?: TestQueryOptions
) =>
  insertOwnerGroups(
    {
      objects: [owner],
    },
    options
  );
