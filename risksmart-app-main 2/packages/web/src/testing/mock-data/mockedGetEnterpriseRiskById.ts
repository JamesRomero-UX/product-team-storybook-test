import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetEnterpriseRiskByIdQuery,
  GetEnterpriseRiskByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEnterpriseRiskByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetEnterpriseRiskById = (
  id: string
): MockedResponse<
  GetEnterpriseRiskByIdQuery,
  GetEnterpriseRiskByIdQueryVariables
> => ({
  request: {
    query: GetEnterpriseRiskByIdDocument,
    variables: { Id: id },
  },
  result: {
    data: {
      enterprise_risk: [],
    },
  },
});
