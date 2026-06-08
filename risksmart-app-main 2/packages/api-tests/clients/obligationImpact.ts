import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ObligationInsertInput } from '../generated/graphql';
import {
  DeleteObligationImpactDocument,
  GetObligationImpactsDocument,
  InsertObligationImpactsDocument,
  UpdateObligationImpactDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getObligationImpacts = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetObligationImpactsDocument,
  });

  return data.obligation_impact;
};

export const insertObligationImpacts = async (
  variables: VariablesOf<typeof InsertObligationImpactsDocument>,
  options?: TestQueryOptions
) => {
  return await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertObligationImpactsDocument,
  });
};

export const insertObligationImpact = async (
  obligation: ObligationInsertInput,
  options?: TestQueryOptions
) => {
  return await insertObligationImpacts(
    {
      objects: [obligation],
    },
    options
  );
};

export const updateObligationImpact = async (
  variables: VariablesOf<typeof UpdateObligationImpactDocument>,
  options?: TestQueryOptions
) => {
  return await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateObligationImpactDocument,
  });
};

export const deleteObligationImpact = async (
  variables: VariablesOf<typeof DeleteObligationImpactDocument>,
  options?: TestQueryOptions
) => {
  return await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteObligationImpactDocument,
  });
};
