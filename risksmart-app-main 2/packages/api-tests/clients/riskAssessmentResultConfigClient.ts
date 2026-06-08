import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  InsertRiskAssessmentResultConfigApiDocument,
  UpdateRiskAssessmentResultConfigApiDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertRiskAssessmentResultConfig = async (
  variables: VariablesOf<typeof InsertRiskAssessmentResultConfigApiDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskAssessmentResultConfigApiDocument,
  });

export const updateRiskAssessmentResultConfig = async (
  variables: VariablesOf<typeof UpdateRiskAssessmentResultConfigApiDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskAssessmentResultConfigApiDocument,
  });
