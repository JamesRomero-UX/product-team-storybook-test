import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import { GetAssessmentByIdDocument } from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getAssessment = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetAssessmentByIdDocument>
) => {
  logger.info('Getting Assessment');
  const result = await hasuraClient.query({
    query: GetAssessmentByIdDocument,
    variables,
  });

  return result.data;
};
