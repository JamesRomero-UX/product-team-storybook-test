import type { VariablesOf } from '@graphql-typed-document-node/core';

import { InsertOrganisationUserDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertUserOrganisation = async (
  variables: VariablesOf<typeof InsertOrganisationUserDocument>,
  options?: TestQueryOptions
) => {
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertOrganisationUserDocument,
  });
};
