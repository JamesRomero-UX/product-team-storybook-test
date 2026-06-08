import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetControlledRiskSecondLineResultByIdDocument,
  GetUncontrolledRiskSecondLineResultByIdDocument,
  InsertDocumentSecondLineResultsDocument,
  InsertObligationSecondLineResultsDocument,
  InsertRiskControlledSecondLineResultsDocument,
  InsertRiskUncontrolledSecondLineResultsDocument,
  UpdateRiskControlledSecondLineResultDocument,
  UpdateRiskUncontrolledSecondLineResultDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertRiskUncontrolledSecondLineResults = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertRiskUncontrolledSecondLineResultsDocument>
) => {
  logger.info('Inserting child RiskUncontrolledSecondLineResults');
  const result = await hasuraClient.mutate({
    mutation: InsertRiskUncontrolledSecondLineResultsDocument,
    variables,
  });

  return result.data?.insert_risk_uncontrolled_second_line_result
    ?.affected_rows;
};

export const insertRiskControlledSecondLineResults = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertRiskControlledSecondLineResultsDocument>
) => {
  logger.info('Inserting child RiskControlledSecondLineResults');
  const result = await hasuraClient.mutate({
    mutation: InsertRiskControlledSecondLineResultsDocument,
    variables,
  });

  return result.data?.insert_risk_controlled_second_line_result?.affected_rows;
};

export const updateRiskControlledSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateRiskControlledSecondLineResultDocument>
) => {
  logger.info('Updating child RiskControlledSecondLineResult');
  const result = await hasuraClient.mutate({
    mutation: UpdateRiskControlledSecondLineResultDocument,
    variables,
  });

  return result.data?.update_risk_controlled_second_line_result?.affected_rows;
};

export const updateRiskUncontrolledSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateRiskUncontrolledSecondLineResultDocument>
) => {
  logger.info('Updating child RiskUncontrolledSecondLineResult');
  const result = await hasuraClient.mutate({
    mutation: UpdateRiskUncontrolledSecondLineResultDocument,
    variables,
  });

  return result.data?.update_risk_uncontrolled_second_line_result
    ?.affected_rows;
};

export const insertDocumentSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertDocumentSecondLineResultsDocument>
) => {
  logger.info('Inserting child DocumentSecondLineResult');
  const result = await hasuraClient.mutate({
    mutation: InsertDocumentSecondLineResultsDocument,
    variables,
  });

  return result.data?.insert_document_second_line_result?.affected_rows;
};

export const insertObligationSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertObligationSecondLineResultsDocument>
) => {
  logger.info('Inserting child ObligationSecondLineResult');
  const result = await hasuraClient.mutate({
    mutation: InsertObligationSecondLineResultsDocument,
    variables,
  });

  return result.data?.insert_obligation_second_line_result?.affected_rows;
};

export const getControlledRiskSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetControlledRiskSecondLineResultByIdDocument>
) => {
  logger.info('Getting ControlledRiskSecondLineResult');
  const result = await hasuraClient.query({
    query: GetControlledRiskSecondLineResultByIdDocument,
    variables,
  });

  return result.data?.risk_controlled_second_line_result;
};

export const getUncontrolledRiskSecondLineResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetUncontrolledRiskSecondLineResultByIdDocument>
) => {
  logger.info('Getting UncontrolledRiskSecondLineResult');
  const result = await hasuraClient.query({
    query: GetUncontrolledRiskSecondLineResultByIdDocument,
    variables,
  });

  return result.data?.risk_uncontrolled_second_line_result;
};
