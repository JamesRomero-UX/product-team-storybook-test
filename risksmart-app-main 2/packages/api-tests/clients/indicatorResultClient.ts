import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { IndicatorResultInsertInput } from '../generated/graphql';
import {
  DeleteIndicatorResultDocument,
  GetIndicatorResultsDocument,
  InsertIndicatorResultDocument,
  UpdateIndicatorResultDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIndicatorResults = async (options?: TestQueryOptions) => {
  const result = await getTestClient().query({
    context: getContext(options),
    query: GetIndicatorResultsDocument,
  });

  return result.data.indicator_result;
};

export const deleteIndicatorResult = async (
  id: string,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables: {
      Id: id,
    },
    mutation: DeleteIndicatorResultDocument,
  });

  return result.data?.delete_indicator_result;
};

export const updateIndicatorResult = async (
  id: string,
  description: string,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables: {
      Id: id,
      Description: description,
    },
    mutation: UpdateIndicatorResultDocument,
  });

  return result.data?.update_indicator_result;
};

export const insertIndicatorResults = async (
  variables: VariablesOf<typeof InsertIndicatorResultDocument>,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: InsertIndicatorResultDocument,
  });

  return result.data?.insert_indicator_result;
};

export const insertIndicatorResult = async (
  indicatorResult: IndicatorResultInsertInput,
  options?: TestQueryOptions
) => insertIndicatorResults({ objects: [indicatorResult] }, options);
