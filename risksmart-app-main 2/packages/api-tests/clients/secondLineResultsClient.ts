import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  DocumentSecondLineResultInsertInput,
  ObligationSecondLineResultInsertInput,
  RiskControlledSecondLineResultInsertInput,
  RiskUncontrolledSecondLineResultInsertInput,
} from '../generated/graphql';
import {
  DeleteDocumentSecondLineResultDocument,
  DeleteObligationSecondLineResultDocument,
  DeleteRiskSecondLineResultDocument,
  GetAllSecondLineResultsDocument,
  GetDocumentSecondLineResultsByParentIdDocument,
  InsertChildDocumentSecondLineResultDocument,
  InsertChildObligationSecondLineResultDocument,
  InsertChildRiskSecondLineResultDocument,
  InsertDocumentSecondLineResultDocument,
  InsertObligationSecondLineResultDocument,
  InsertRiskControlledSecondLineResultDocument,
  InsertRiskUncontrolledSecondLineResultDocument,
  UpdateDocumentSecondLineResultDocument,
  UpdateObligationSecondLineResultDocument,
  UpdateRiskControlledSecondLineResultDocument,
  UpdateRiskUncontrolledSecondLineResultDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

// Document Assessments
export const deleteDocumentSecondLineResult = async (
  variables: VariablesOf<typeof DeleteDocumentSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteDocumentSecondLineResultDocument,
  });

export const updateDocumentSecondLineResult = async (
  variables: VariablesOf<typeof UpdateDocumentSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateDocumentSecondLineResultDocument,
  });

export const insertDocumentSecondLineResults = async (
  variables: VariablesOf<typeof InsertDocumentSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDocumentSecondLineResultDocument,
  });

export const insertDocumentSecondLineResult = async (
  documentSecondLineResult: DocumentSecondLineResultInsertInput,
  options?: TestQueryOptions
) =>
  insertDocumentSecondLineResults(
    {
      objects: [documentSecondLineResult],
    },
    options
  );

export const insertChildDocumentSecondLineResult = async (
  documentSecondLineResult: VariablesOf<
    typeof InsertChildDocumentSecondLineResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...documentSecondLineResult,
    },
    context: getContext(options),
    mutation: InsertChildDocumentSecondLineResultDocument,
  });

export const getDocumentSecondLineResults = async (
  variables: VariablesOf<typeof GetDocumentSecondLineResultsByParentIdDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetDocumentSecondLineResultsByParentIdDocument,
    })
  ).data.document_second_line_result;

export const deleteObligationSecondLineResult = async (
  variables: VariablesOf<typeof DeleteObligationSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteObligationSecondLineResultDocument,
  });

export const updateObligationSecondLineResult = async (
  variables: VariablesOf<typeof UpdateObligationSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateObligationSecondLineResultDocument,
  });

export const insertObligationSecondLineResults = async (
  variables: VariablesOf<typeof InsertObligationSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertObligationSecondLineResultDocument,
  });

export const insertObligationSecondLineResult = async (
  obligationSecondLineResult: ObligationSecondLineResultInsertInput,
  options?: TestQueryOptions
) =>
  insertObligationSecondLineResults(
    {
      objects: [obligationSecondLineResult],
    },
    options
  );

export const insertChildObligationSecondLineResult = async (
  obligationSecondLineResult: VariablesOf<
    typeof InsertChildObligationSecondLineResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...obligationSecondLineResult,
    },
    context: getContext(options),
    mutation: InsertChildObligationSecondLineResultDocument,
  });

export const getObligationSecondLineResults = async (
  variables: VariablesOf<typeof GetAllSecondLineResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllSecondLineResultsDocument,
    })
  ).data.obligation_second_line_result;

export const deleteRiskSecondLineResult = async (
  variables: VariablesOf<typeof DeleteRiskSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteRiskSecondLineResultDocument,
  });

export const updateRiskControlledSecondLineResult = async (
  variables: VariablesOf<typeof UpdateRiskControlledSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskControlledSecondLineResultDocument,
  });

export const updateRiskUncontrolledSecondLineResult = async (
  variables: VariablesOf<typeof UpdateRiskUncontrolledSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskUncontrolledSecondLineResultDocument,
  });

export const insertRiskControlledSecondLineResults = async (
  variables: VariablesOf<typeof InsertRiskControlledSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskControlledSecondLineResultDocument,
  });

export const insertRiskUncontrolledSecondLineResults = async (
  variables: VariablesOf<typeof InsertRiskUncontrolledSecondLineResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskUncontrolledSecondLineResultDocument,
  });

export const insertRiskUncontrolledSecondLineResult = async (
  riskSecondLineResult: RiskUncontrolledSecondLineResultInsertInput,
  options?: TestQueryOptions
) =>
  insertRiskUncontrolledSecondLineResults(
    {
      objects: [riskSecondLineResult],
    },
    options
  );

export const insertRiskControlledSecondLineResult = async (
  riskSecondLineResult: RiskControlledSecondLineResultInsertInput,
  options?: TestQueryOptions
) =>
  insertRiskControlledSecondLineResults(
    {
      objects: [riskSecondLineResult],
    },
    options
  );

export const insertChildRiskSecondLineResult = async (
  riskSecondLineResult: VariablesOf<
    typeof InsertChildRiskSecondLineResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...riskSecondLineResult,
    },
    context: getContext(options),
    mutation: InsertChildRiskSecondLineResultDocument,
  });

export const getRiskControlledSecondLineResults = async (
  variables: VariablesOf<typeof GetAllSecondLineResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllSecondLineResultsDocument,
    })
  ).data.risk_controlled_second_line_result;

export const getRiskUncontrolledSecondLineResults = async (
  variables: VariablesOf<typeof GetAllSecondLineResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllSecondLineResultsDocument,
    })
  ).data.risk_uncontrolled_second_line_result;
