import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  GetOrganisationsDocument,
  InsertOrganisationDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertOrganisation = async (
  variables: VariablesOf<typeof InsertOrganisationDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertOrganisationDocument,
  });
export const getOrganisations = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetOrganisationsDocument,
  });
