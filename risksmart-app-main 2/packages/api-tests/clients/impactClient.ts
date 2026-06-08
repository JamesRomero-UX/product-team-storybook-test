import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  DeleteImpactDocument,
  GetImpactsDocument,
  InsertImpactBackendDocument,
  UpdateImpactDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertImpactBackend = async (
  variables: VariablesOf<typeof InsertImpactBackendDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertImpactBackendDocument,
  });

export const getAllImpacts = async (options?: TestQueryOptions) =>
  getTestClient().query({
    context: getContext(options),
    query: GetImpactsDocument,
  });

export const updateImpact = async (
  variables: VariablesOf<typeof UpdateImpactDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateImpactDocument,
  });

export const deleteImpact = async (
  variables: VariablesOf<typeof DeleteImpactDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteImpactDocument,
  });
