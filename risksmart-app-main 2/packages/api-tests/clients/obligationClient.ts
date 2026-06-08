import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ObligationInsertInput } from '../generated/graphql';
import { InsertObligationsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

const insertObligations = async (
  variables: VariablesOf<typeof InsertObligationsDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertObligationsDocument,
  });

export const insertObligation = async (
  obligation: ObligationInsertInput,
  options?: TestQueryOptions
) =>
  await insertObligations(
    {
      objects: [obligation],
    },
    options
  );
