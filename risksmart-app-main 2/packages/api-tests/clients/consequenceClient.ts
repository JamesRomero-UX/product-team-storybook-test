import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ConsequenceInsertInput } from '../generated/graphql';
import {
  DeleteConsequenceDocument,
  GetAllConsequencesDocument,
  InsertConsequenceDocument,
  UpdateConsequenceDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteConsequence = async (
  id: string,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables: {
      Id: id,
    },
    context: getContext(options),
    mutation: DeleteConsequenceDocument,
  });

export const updateConsequence = async (
  variables: VariablesOf<typeof UpdateConsequenceDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateConsequenceDocument,
  });

export const insertConsequences = async (
  variables: VariablesOf<typeof InsertConsequenceDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertConsequenceDocument,
  });

export const insertConsequence = async (
  consequence: ConsequenceInsertInput,
  options?: TestQueryOptions
) => await insertConsequences({ objects: [consequence] }, options);

export const getConsequences = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetAllConsequencesDocument,
    })
  ).data.consequence;
