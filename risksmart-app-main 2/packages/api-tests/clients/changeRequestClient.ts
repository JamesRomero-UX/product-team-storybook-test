import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  GetAllChangeRequestsDocument,
  GetChangeRequestDocument,
  GetChangeRequestsDocument,
  InsertChangeRequestDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getChangeRequests = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetChangeRequestsDocument,
    })
  ).data.change_request;

export const getAllChangeRequests = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetAllChangeRequestsDocument,
    })
  ).data.change_request;

export const getChangeRequestById = async (
  variables: VariablesOf<typeof GetChangeRequestDocument>,
  options?: TestQueryOptions
) => {
  return (
    await getTestClient().query({
      context: getContext(options),
      query: GetChangeRequestDocument,
      variables,
    })
  ).data.change_request_by_pk;
};

export const insertChangeRequests = async (
  variables: VariablesOf<typeof InsertChangeRequestDocument>,
  options?: TestQueryOptions
) => {
  return (
    await getTestClient().mutate({
      context: getContext(options),
      mutation: InsertChangeRequestDocument,
      variables,
    })
  ).data;
};
