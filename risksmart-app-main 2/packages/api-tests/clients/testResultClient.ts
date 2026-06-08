import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  GetTestResultsByControlIdDocument,
  InsertControlTestResultDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getTestResultsByControlId = async (
  variables: VariablesOf<typeof GetTestResultsByControlIdDocument>,
  options?: TestQueryOptions
) => {
  const { data } = await getTestClient().query({
    variables,
    context: getContext(options),
    query: GetTestResultsByControlIdDocument,
  });

  return data.test_result;
};

export const insertControlTestResult = async (
  variables: VariablesOf<typeof InsertControlTestResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: InsertControlTestResultDocument,
  });
