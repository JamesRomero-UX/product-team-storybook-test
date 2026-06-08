import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetControlledRiskInternalAuditResultByIdDocument,
  GetUncontrolledRiskInternalAuditResultByIdDocument,
  InsertDocumentInternalAuditResultsDocument,
  InsertObligationInternalAuditResultsDocument,
  InsertRiskControlledInternalAuditResultsDocument,
  InsertRiskUncontrolledInternalAuditResultsDocument,
  UpdateRiskControlledInternalAuditResultDocument,
  UpdateRiskUncontrolledInternalAuditResultDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertRiskUncontrolledInternalAuditResults = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof InsertRiskUncontrolledInternalAuditResultsDocument
  >
) => {
  logger.info('Inserting child RiskUncontrolledInternalAuditResults');
  const result = await hasuraClient.mutate({
    mutation: InsertRiskUncontrolledInternalAuditResultsDocument,
    variables,
  });

  return result.data?.insert_risk_uncontrolled_internal_audit_result
    ?.affected_rows;
};

export const insertRiskControlledInternalAuditResults = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof InsertRiskControlledInternalAuditResultsDocument
  >
) => {
  logger.info('Inserting child RiskControlledInternalAuditResults');
  const result = await hasuraClient.mutate({
    mutation: InsertRiskControlledInternalAuditResultsDocument,
    variables,
  });

  return result.data?.insert_risk_controlled_internal_audit_result
    ?.affected_rows;
};

export const updateRiskControlledInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateRiskControlledInternalAuditResultDocument>
) => {
  logger.info('Updating child RiskControlledInternalAuditResult');
  const result = await hasuraClient.mutate({
    mutation: UpdateRiskControlledInternalAuditResultDocument,
    variables,
  });

  return result.data?.update_risk_controlled_internal_audit_result
    ?.affected_rows;
};

export const updateRiskUncontrolledInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof UpdateRiskUncontrolledInternalAuditResultDocument
  >
) => {
  logger.info('Updating child RiskUncontrolledInternalAuditResult');
  const result = await hasuraClient.mutate({
    mutation: UpdateRiskUncontrolledInternalAuditResultDocument,
    variables,
  });

  return result.data?.update_risk_uncontrolled_internal_audit_result
    ?.affected_rows;
};

export const insertDocumentInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertDocumentInternalAuditResultsDocument>
) => {
  logger.info('Inserting child DocumentInternalAuditResult');
  const result = await hasuraClient.mutate({
    mutation: InsertDocumentInternalAuditResultsDocument,
    variables,
  });

  return result.data?.insert_document_internal_audit_result?.affected_rows;
};

export const insertObligationInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertObligationInternalAuditResultsDocument>
) => {
  logger.info('Inserting child ObligationInternalAuditResult');
  const result = await hasuraClient.mutate({
    mutation: InsertObligationInternalAuditResultsDocument,
    variables,
  });

  return result.data?.insert_obligation_internal_audit_result?.affected_rows;
};

export const getControlledRiskInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof GetControlledRiskInternalAuditResultByIdDocument
  >
) => {
  logger.info('Getting ControlledRiskInternalAuditResult');
  const result = await hasuraClient.query({
    query: GetControlledRiskInternalAuditResultByIdDocument,
    variables,
  });

  return result.data?.risk_controlled_internal_audit_result;
};

export const getUncontrolledRiskInternalAuditResult = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<
    typeof GetUncontrolledRiskInternalAuditResultByIdDocument
  >
) => {
  logger.info('Getting UncontrolledRiskInternalAuditResult');
  const result = await hasuraClient.query({
    query: GetUncontrolledRiskInternalAuditResultByIdDocument,
    variables,
  });

  return result.data?.risk_uncontrolled_internal_audit_result;
};
