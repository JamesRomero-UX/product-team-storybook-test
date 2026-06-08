import type { VariablesOf } from '@graphql-typed-document-node/core';

import { InsertControlParentsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertControlParents = async (
  variables: VariablesOf<typeof InsertControlParentsDocument>,
  options?: TestQueryOptions
) => {
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertControlParentsDocument,
  });
};
