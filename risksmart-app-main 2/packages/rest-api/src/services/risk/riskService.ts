import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  GetChildRiskIdsDocument,
  GetChildRisksDocument,
  GetRiskByIdDocument,
  GetRiskByResultIdDocument,
} from 'generated/graphql';

export const getRisk = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetRiskByIdDocument>
) => {
  const result = await hasuraClient.mutate({
    mutation: GetRiskByIdDocument,
    variables,
  });

  return result.data?.risk;
};

export const getRisksByResultId = async (
  hasuraClient: ApolloClient<unknown>,
  assessmentResultId: string
) => {
  const result = await hasuraClient.query({
    query: GetRiskByResultIdDocument,
    variables: { AssessmentResultId: assessmentResultId },
  });

  return result.data?.risk;
};

export const getChildRiskIds = async (
  hasuraClient: ApolloClient<unknown>,
  riskId: string
) => {
  const result = await hasuraClient.query({
    query: GetChildRiskIdsDocument,
    variables: { riskId },
  });

  return result.data?.risk;
};

export const getChildRisks = async (
  hasuraClient: ApolloClient<unknown>,
  riskId: string
) => {
  const result = await hasuraClient.query({
    query: GetChildRisksDocument,
    variables: { riskId },
  });

  return result.data?.risk;
};
