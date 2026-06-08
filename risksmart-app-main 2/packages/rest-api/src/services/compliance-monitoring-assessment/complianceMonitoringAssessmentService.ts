import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetComplianceMonitoringAssessmentByIdDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getComplianceMonitoringAssessment = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetComplianceMonitoringAssessmentByIdDocument>
) => {
  logger.info('Getting ComplianceMonitoringAssessment');
  const result = await hasuraClient.query({
    query: GetComplianceMonitoringAssessmentByIdDocument,
    variables,
  });

  return result.data;
};
