import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  DocumentAssessmentResultInsertInput,
  ObligationAssessmentResultInsertInput,
  RiskAssessmentResultInsertInput,
} from '../generated/graphql';
import {
  DeleteDocumentAssessmentResultDocument,
  DeleteObligationAssessmentResultDocument,
  DeleteRiskAssessmentResultDocument,
  GetAllAssessmentResultsDocument,
  GetRatingDocumentAssessmentResultsByParentIdDocument,
  InsertChildDocumentAssessmentResultDocument,
  InsertChildObligationAssessmentResultDocument,
  InsertChildRiskAssessmentResultDocument,
  InsertDocumentAssessmentResultDocument,
  InsertObligationAssessmentResultDocument,
  InsertRiskAssessmentResultDocument,
  UpdateChildRiskAssessmentResultDocument,
  UpdateDocumentAssessmentResultDocument,
  UpdateObligationAssessmentResultDocument,
  UpdateRiskAssessmentResultDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

// Document Assessments
export const deleteDocumentAssessmentResult = async (
  variables: VariablesOf<typeof DeleteDocumentAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteDocumentAssessmentResultDocument,
  });

export const updateDocumentAssessmentResult = async (
  variables: VariablesOf<typeof UpdateDocumentAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateDocumentAssessmentResultDocument,
  });

export const insertDocumentAssessmentResults = async (
  variables: VariablesOf<typeof InsertDocumentAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDocumentAssessmentResultDocument,
  });

export const insertDocumentAssessmentResult = async (
  documentAssessmentResult: DocumentAssessmentResultInsertInput,
  options?: TestQueryOptions
) =>
  insertDocumentAssessmentResults(
    {
      objects: [documentAssessmentResult],
    },
    options
  );

export const insertChildDocumentAssessmentResult = async (
  documentAssessmentResult: VariablesOf<
    typeof InsertChildDocumentAssessmentResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...documentAssessmentResult,
    },
    context: getContext(options),
    mutation: InsertChildDocumentAssessmentResultDocument,
  });

export const getDocumentAssessmentResults = async (
  variables: VariablesOf<typeof GetAllAssessmentResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllAssessmentResultsDocument,
    })
  ).data.document_assessment_result;

export const getRatingDocumentAssessmentResults = async (
  variables: VariablesOf<
    typeof GetRatingDocumentAssessmentResultsByParentIdDocument
  >,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetRatingDocumentAssessmentResultsByParentIdDocument,
    })
  ).data.document_assessment_result;

export const deleteObligationAssessmentResult = async (
  variables: VariablesOf<typeof DeleteObligationAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteObligationAssessmentResultDocument,
  });

export const updateObligationAssessmentResult = async (
  variables: VariablesOf<typeof UpdateObligationAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateObligationAssessmentResultDocument,
  });

export const insertObligationAssessmentResults = async (
  variables: VariablesOf<typeof InsertObligationAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertObligationAssessmentResultDocument,
  });

export const insertObligationAssessmentResult = async (
  obligationAssessmentResult: ObligationAssessmentResultInsertInput,
  options?: TestQueryOptions
) =>
  insertObligationAssessmentResults(
    {
      objects: [obligationAssessmentResult],
    },
    options
  );

export const insertChildObligationAssessmentResult = async (
  obligationAssessmentResult: VariablesOf<
    typeof InsertChildObligationAssessmentResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...obligationAssessmentResult,
    },
    context: getContext(options),
    mutation: InsertChildObligationAssessmentResultDocument,
  });

export const getObligationAssessmentResults = async (
  variables: VariablesOf<typeof GetAllAssessmentResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllAssessmentResultsDocument,
    })
  ).data.obligation_assessment_result;

export const deleteRiskAssessmentResult = async (
  variables: VariablesOf<typeof DeleteRiskAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteRiskAssessmentResultDocument,
  });

export const updateRiskAssessmentResult = async (
  variables: VariablesOf<typeof UpdateRiskAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateRiskAssessmentResultDocument,
  });

export const updateChildRiskAssessmentResult = async (
  variables: VariablesOf<typeof UpdateChildRiskAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateChildRiskAssessmentResultDocument,
  });

export const insertRiskAssessmentResults = async (
  variables: VariablesOf<typeof InsertRiskAssessmentResultDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRiskAssessmentResultDocument,
  });

export const insertRiskAssessmentResult = async (
  riskAssessmentResult: RiskAssessmentResultInsertInput,
  options?: TestQueryOptions
) =>
  insertRiskAssessmentResults(
    {
      objects: [riskAssessmentResult],
    },
    options
  );

export const insertChildRiskAssessmentResult = async (
  riskAssessmentResult: VariablesOf<
    typeof InsertChildRiskAssessmentResultDocument
  >,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      ...riskAssessmentResult,
    },
    context: getContext(options),
    mutation: InsertChildRiskAssessmentResultDocument,
  });

export const getRiskAssessmentResults = async (
  variables: VariablesOf<typeof GetAllAssessmentResultsDocument>,
  options?: TestQueryOptions
) =>
  (
    await getTestClient().query({
      variables,
      context: getContext(options),
      query: GetAllAssessmentResultsDocument,
    })
  ).data.risk_assessment_result;
