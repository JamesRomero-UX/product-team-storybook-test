import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import {
  Appetite_Model_Enum,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useGetAggregationSettingsForOrg } from './queries';

type AggregationSettings = {
  loading: boolean;
  riskModel: Risk_Scoring_Model_Enum;
  appetiteAggregation: Appetite_Model_Enum;
  enableTierTwoCascading: boolean;
};

export const useAggregation = (): AggregationSettings => {
  const { isAuthenticated } = useRisksmartUser();

  const { data, loading } = useGetAggregationSettingsForOrg({
    queryArgs: {},
    shouldSkip: !isAuthenticated,
  });

  return {
    loading,
    riskModel:
      data?.aggregation_org?.[0]?.RiskScoringModel ??
      Risk_Scoring_Model_Enum.Default,
    appetiteAggregation:
      data?.aggregation_org?.[0]?.Appetite ?? Appetite_Model_Enum.Default,
    enableTierTwoCascading:
      data?.aggregation_org?.[0]?.Config?.enableTierTwoCascading ?? false,
  };
};
