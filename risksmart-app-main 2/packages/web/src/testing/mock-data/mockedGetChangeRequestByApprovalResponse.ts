import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetChangeRequestsByApprovalQuery,
  GetChangeRequestsByApprovalQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetChangeRequestsByApprovalDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetChangeRequestByApprovalResponse: MockedResponse<
  GetChangeRequestsByApprovalQuery,
  GetChangeRequestsByApprovalQueryVariables
> = {
  request: {
    query: GetChangeRequestsByApprovalDocument,
    variables: {
      approvalId: '1',
    },
  },
  result: {
    data: {
      change_request: [],
    },
  },
};
