import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetDocumentAssessmentResultByIdDocument,
  GetObligationAssessmentResultByIdDocument,
  GetRiskAssessmentResultByIdDocument,
  InsertDocumentAssessmentResultsDocument,
  InsertObligationAssessmentResultsDocument,
  InsertRiskAssessmentResultsDocument,
  UpdateRiskAssessmentResultDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertRiskAssessmentResults = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertRiskAssessmentResultsDocument>
) => {
  logger.info('Inserting child RiskAssessmentResults');
  const result = await hasuraClient.mutate({
    mutation: InsertRiskAssessmentResultsDocument,
    variables,
  });

  return result.data?.insert_risk_assessment_result?.affected_rows;
};

export const updateRiskAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateRiskAssessmentResultDocument>
) => {
  logger.info('Updating child RiskAssessmentResult');
  const result = await hasuraClient.mutate({
    mutation: UpdateRiskAssessmentResultDocument,
    variables,
  });

  return result.data?.update_risk_assessment_result?.affected_rows;
};

export const insertDocumentAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertDocumentAssessmentResultsDocument>
) => {
  logger.info('Inserting child DocumentAssessmentResult');
  const result = await hasuraClient.mutate({
    mutation: InsertDocumentAssessmentResultsDocument,
    variables,
  });

  return result.data?.insert_document_assessment_result?.affected_rows;
};

export const insertObligationAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertObligationAssessmentResultsDocument>
) => {
  logger.info('Inserting child ObligationAssessmentResult');
  const result = await hasuraClient.mutate({
    mutation: InsertObligationAssessmentResultsDocument,
    variables,
  });

  return result.data?.insert_obligation_assessment_result?.affected_rows;
};

export const getRiskAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetRiskAssessmentResultByIdDocument>
) => {
  logger.info('Getting RiskAssessmentResult');
  const result = await hasuraClient.query({
    query: GetRiskAssessmentResultByIdDocument,
    variables,
  });

  return result.data?.risk_assessment_result;
};

export const getDocumentAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetDocumentAssessmentResultByIdDocument>
) => {
  const result = await hasuraClient.query({
    query: GetDocumentAssessmentResultByIdDocument,
    variables,
  });

  return result.data?.document_assessment_result;
};

export const getObligationAssessmentResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetObligationAssessmentResultByIdDocument>
) => {
  const result = await hasuraClient.query({
    query: GetObligationAssessmentResultByIdDocument,
    variables,
  });

  return result.data?.obligation_assessment_result;
};
