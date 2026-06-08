import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetEnterpriseRisksQuery,
  GetEnterpriseRisksQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEnterpriseRisksDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetEnterpriseRisks: MockedResponse<
  GetEnterpriseRisksQuery,
  GetEnterpriseRisksQueryVariables
> = {
  request: {
    query: GetEnterpriseRisksDocument,
    variables: {},
  },
  result: {
    data: {
      enterprise_risk: [],
    },
  },
};
