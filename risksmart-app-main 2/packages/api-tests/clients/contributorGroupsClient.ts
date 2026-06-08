import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { OwnerGroupInsertInput } from '../generated/graphql';
import {
  DeleteContributorGroupDocument,
  GetContributorGroupsDocument,
  InsertContributorGroupsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getContributorGroups = async (options?: TestQueryOptions) => {
  const { data, errors } = await getTestClient().query({
    context: getContext(options),
    query: GetContributorGroupsDocument,
  });
  if (errors) {
    throw errors[0];
  }

  return data.contributor_group;
};

export const deleteContributorGroup = async (
  variables: VariablesOf<typeof DeleteContributorGroupDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteContributorGroupDocument,
  });

export const insertContributorGroups = async (
  variables: VariablesOf<typeof InsertContributorGroupsDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertContributorGroupsDocument,
  });

export const insertContributorGroup = async (
  owner: OwnerGroupInsertInput,
  options?: TestQueryOptions
) =>
  insertContributorGroups(
    {
      objects: [owner],
    },
    options
  );
