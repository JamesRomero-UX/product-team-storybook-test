import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ComplianceMonitoringAssessmentInsertInput } from '../generated/graphql';
import {
  DeleteComplianceMonitoringAssessmentDocument,
  GetAllComplianceMonitoringAssessmentIdsDocument,
  InsertComplianceMonitoringAssessmentDocument,
  UpdateComplianceMonitoringAssessmentDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteComplianceMonitoringAssessment = async (
  variables: VariablesOf<typeof DeleteComplianceMonitoringAssessmentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteComplianceMonitoringAssessmentDocument,
  });

export const updateComplianceMonitoringAssessment = async (
  variables: VariablesOf<typeof UpdateComplianceMonitoringAssessmentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateComplianceMonitoringAssessmentDocument,
  });

export const insertComplianceMonitoringAssessments = async (
  variables: VariablesOf<typeof InsertComplianceMonitoringAssessmentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertComplianceMonitoringAssessmentDocument,
  });

export const insertComplianceMonitoringAssessment = async (
  complianceMonitoringAssessment: ComplianceMonitoringAssessmentInsertInput,
  options?: TestQueryOptions
) =>
  insertComplianceMonitoringAssessments(
    {
      objects: [complianceMonitoringAssessment],
    },
    options
  );

export const getComplianceMonitoringAssessmentIds = async (
  options?: TestQueryOptions
) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllComplianceMonitoringAssessmentIdsDocument,
  });

export const getComplianceMonitoringAssessments = async (
  options?: TestQueryOptions
) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllComplianceMonitoringAssessmentIdsDocument,
  });
