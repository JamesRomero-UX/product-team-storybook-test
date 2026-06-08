import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  DocumentInternalAuditResultInsertInput,
  ObligationInternalAuditResultInsertInput,
  RiskControlledInternalAuditResultInsertInput,
  RiskUncontrolledInternalAuditResultInsertInput,
} from '../generated/graphql';
import {
  DeleteDocumentInternalAuditResultDocument,
  DeleteObligationInternalAuditResultDocument,
  DeleteRiskInternalAuditResultDocument,
  GetAllInternalAuditResultsDocument,
  GetDocumentInternalAuditResultsByParentIdDocument,
  InsertChildDocumentInternalAuditResultDocument,
  InsertChildObligationInternalAuditResultDocument,
  InsertChildRiskInternalAuditResultDocument,
  InsertDocumentInternalAuditResultDocument,
  InsertObligationInternalAuditResultDocument,
  InsertRiskControlledInternalAuditResultDocument,
  InsertRiskUncontrolledInternalAuditResultDocument,
  UpdateDocumentInternalAuditResultDocument,
  UpdateObligationInternalAuditResultDocument,
  UpdateRiskControlledInternalAuditResultDocument,
  UpdateRiskUncontrolledInternalAuditResultDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

// Document Assessments
export const deleteDocumentInternalAuditResult = async (
  variables: VariablesOf<typeof DeleteDocumentInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteDocumentInternalAuditResultDocument,
  });

export const updateDocumentInternalAuditResult = async (
  variables: VariablesOf<typeof UpdateDocumentInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateDocumentInternalAuditResultDocument,
  });

export const insertDocumentInternalAuditResults = async (
  variables: VariablesOf<typeof InsertDocumentInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDocumentInternalAuditResultDocument,
  });

export const insertDocumentInternalAuditResult = async (
  documentInternalAuditResult: DocumentInternalAuditResultInsertInput,
  options?: TestQueryOptions
) =>
  insertDocumentInternalAuditResults(
    {
      objects: [documentInternalAuditResult],
    },
    options
  );

export const insertChildDocumentInternalAuditResult = async (
  documentInternalAuditResult: VariablesOf<
    typeof InsertChildDocumentInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...documentInternalAuditResult,
    },
    context: getContext(options),
    mutation: InsertChildDocumentInternalAuditResultDocument,
  });

export const getDocumentInternalAuditResults = async (
  variables: VariablesOf<
    typeof GetDocumentInternalAuditResultsByParentIdDocument
  >,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetDocumentInternalAuditResultsByParentIdDocument,
    })
  ).data.document_internal_audit_result;

export const deleteObligationInternalAuditResult = async (
  variables: VariablesOf<typeof DeleteObligationInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteObligationInternalAuditResultDocument,
  });

export const updateObligationInternalAuditResult = async (
  variables: VariablesOf<typeof UpdateObligationInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateObligationInternalAuditResultDocument,
  });

export const insertObligationInternalAuditResults = async (
  variables: VariablesOf<typeof InsertObligationInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertObligationInternalAuditResultDocument,
  });

export const insertObligationInternalAuditResult = async (
  obligationInternalAuditResult: ObligationInternalAuditResultInsertInput,
  options?: TestQueryOptions
) =>
  insertObligationInternalAuditResults(
    {
      objects: [obligationInternalAuditResult],
    },
    options
  );

export const insertChildObligationInternalAuditResult = async (
  obligationInternalAuditResult: VariablesOf<
    typeof InsertChildObligationInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...obligationInternalAuditResult,
    },
    context: getContext(options),
    mutation: InsertChildObligationInternalAuditResultDocument,
  });

export const getObligationInternalAuditResults = async (
  variables: VariablesOf<typeof GetAllInternalAuditResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllInternalAuditResultsDocument,
    })
  ).data.obligation_internal_audit_result;

export const deleteRiskInternalAuditResult = async (
  variables: VariablesOf<typeof DeleteRiskInternalAuditResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteRiskInternalAuditResultDocument,
  });

export const updateRiskControlledInternalAuditResult = async (
  variables: VariablesOf<
    typeof UpdateRiskControlledInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskControlledInternalAuditResultDocument,
  });

export const updateRiskUncontrolledInternalAuditResult = async (
  variables: VariablesOf<
    typeof UpdateRiskUncontrolledInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskUncontrolledInternalAuditResultDocument,
  });

export const insertRiskControlledInternalAuditResults = async (
  variables: VariablesOf<
    typeof InsertRiskControlledInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskControlledInternalAuditResultDocument,
  });

export const insertRiskUncontrolledInternalAuditResults = async (
  variables: VariablesOf<
    typeof InsertRiskUncontrolledInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskUncontrolledInternalAuditResultDocument,
  });

export const insertRiskUncontrolledInternalAuditResult = async (
  riskInternalAuditResult: RiskUncontrolledInternalAuditResultInsertInput,
  options?: TestQueryOptions
) =>
  insertRiskUncontrolledInternalAuditResults(
    {
      objects: [riskInternalAuditResult],
    },
    options
  );

export const insertRiskControlledInternalAuditResult = async (
  riskInternalAuditResult: RiskControlledInternalAuditResultInsertInput,
  options?: TestQueryOptions
) =>
  insertRiskControlledInternalAuditResults(
    {
      objects: [riskInternalAuditResult],
    },
    options
  );

export const insertChildRiskInternalAuditResult = async (
  riskInternalAuditResult: VariablesOf<
    typeof InsertChildRiskInternalAuditResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...riskInternalAuditResult,
    },
    context: getContext(options),
    mutation: InsertChildRiskInternalAuditResultDocument,
  });

export const getRiskControlledInternalAuditResults = async (
  variables: VariablesOf<typeof GetAllInternalAuditResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllInternalAuditResultsDocument,
    })
  ).data.risk_controlled_internal_audit_result;

export const getRiskUncontrolledInternalAuditResults = async (
  variables: VariablesOf<typeof GetAllInternalAuditResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllInternalAuditResultsDocument,
    })
  ).data.risk_uncontrolled_internal_audit_result;
