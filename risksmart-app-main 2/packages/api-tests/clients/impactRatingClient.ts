import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ImpactRatingInsertInput } from '../generated/graphql';
import {
  DeleteImpactRatingDocument,
  GetImpactRatingsDocument,
  InsertChildImpactRatingDocument,
  InsertImpactRatingDocument,
  UpdateImpactRatingDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertImpactRatings = async (
  variables: VariablesOf<typeof InsertImpactRatingDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertImpactRatingDocument,
  });

export const insertImpactRating = async (
  impact: ImpactRatingInsertInput,
  options?: TestQueryOptions
) => insertImpactRatings({ objects: [impact] }, options);

export const getAllImpactRatings = async (options?: TestQueryOptions) =>
  getTestClient().query({
    context: getContext(options),
    query: GetImpactRatingsDocument,
  });

export const updateImpactRating = async (
  variables: VariablesOf<typeof UpdateImpactRatingDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateImpactRatingDocument,
  });

export const deleteImpactRating = async (
  variables: VariablesOf<typeof DeleteImpactRatingDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteImpactRatingDocument,
  });

export const insertChildImpactRating = async (
  variables: VariablesOf<typeof InsertChildImpactRatingDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertChildImpactRatingDocument,
  });
