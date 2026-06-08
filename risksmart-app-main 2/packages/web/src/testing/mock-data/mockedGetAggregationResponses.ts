import type { MockedResponse } from '@apollo/client/testing';
import type {
  Appetite_Model_Enum,
  GetAggregationSettingsForOrgQuery,
  GetAggregationSettingsForOrgQueryVariables,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAggregationSettingsForOrgDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAggregationResponse = (
  riskScoringModel: null | Risk_Scoring_Model_Enum = null,
  appetiteScoringModel: Appetite_Model_Enum | null = null
): MockedResponse<
  GetAggregationSettingsForOrgQuery,
  GetAggregationSettingsForOrgQueryVariables
> => ({
  request: {
    query: GetAggregationSettingsForOrgDocument,
  },
  result: {
    data: {
      aggregation_org: [
        {
          __typename: 'aggregation_org',
          RiskScoringModel: riskScoringModel,
          Appetite: appetiteScoringModel,
        },
      ],
    },
  },
});
