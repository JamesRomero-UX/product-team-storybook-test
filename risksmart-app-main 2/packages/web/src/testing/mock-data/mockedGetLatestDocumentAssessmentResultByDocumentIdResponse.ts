import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestDocumentAssessmentResultByDocumentIdQuery,
  GetLatestDocumentAssessmentResultByDocumentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestDocumentAssessmentResultByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestDocumentAssessmentResultByDocumentIdResponse = (
  variables: GetLatestDocumentAssessmentResultByDocumentIdQueryVariables,
  response: GetLatestDocumentAssessmentResultByDocumentIdQuery = {
    document_assessment_result: [],
  }
): MockedResponse<
  GetLatestDocumentAssessmentResultByDocumentIdQuery,
  GetLatestDocumentAssessmentResultByDocumentIdQueryVariables
> => ({
  request: {
    query: GetLatestDocumentAssessmentResultByDocumentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
