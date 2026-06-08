import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  GetAllControlGroupsDocument,
  InsertControlGroupDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertControlGroup = async (
  variables: VariablesOf<typeof InsertControlGroupDocument>,
  options?: TestQueryOptions
) => {
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertControlGroupDocument,
  });
};

export const getAllControlGroups = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetAllControlGroupsDocument,
    })
  ).data.control_group;
