import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDocumentAssessmentResultsByParentIdQuery,
  GetDocumentAssessmentResultsByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentAssessmentResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentAssessmentResultsByParentIdResponse = (
  variables: GetDocumentAssessmentResultsByParentIdQueryVariables,
  response: GetDocumentAssessmentResultsByParentIdQuery = {
    document_assessment_result: [],
  }
): MockedResponse<
  GetDocumentAssessmentResultsByParentIdQuery,
  GetDocumentAssessmentResultsByParentIdQueryVariables
> => ({
  request: {
    query: GetDocumentAssessmentResultsByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
