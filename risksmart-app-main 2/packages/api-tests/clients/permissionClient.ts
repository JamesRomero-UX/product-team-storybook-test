import type { VariablesOf } from '@graphql-typed-document-node/core';

import { GetPermissionsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getPermissions = async (
  variables: VariablesOf<typeof GetPermissionsDocument>,
  options?: TestQueryOptions
) => {
  const { data } = await getTestClient().query({
    variables,
    context: getContext(options),
    query: GetPermissionsDocument,
  });

  return data.permission;
};
