import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetEnterpriseRisksByTierQuery,
  GetEnterpriseRisksByTierQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEnterpriseRisksByTierDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetEnterpriseRisksByTier = (
  tier: number
): MockedResponse<
  GetEnterpriseRisksByTierQuery,
  GetEnterpriseRisksByTierQueryVariables
> => ({
  request: {
    query: GetEnterpriseRisksByTierDocument,
    variables: { Tier: tier },
  },
  result: {
    data: {
      enterprise_risk: [],
    },
  },
});
