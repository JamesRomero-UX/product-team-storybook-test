import type { GetLatestRiskScoresByRiskIdSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';

type RiskScore = GetLatestRiskScoresByRiskIdSubscription['risk_score'][number];

const defaultRiskScores: RiskScore = {
  ModifiedAtTimestamp: '2024-08-21T09:49:04.958+00:00',
  ResidualScore: 0,
  ResidualRating: 0,
  InherentScore: 9,
  InherentRating: 3,
  ResidualImpact: null,
  ResidualLikelihood: null,
  InherentImpact: 3,
  InherentLikelihood: 3,
  __typename: 'risk_score',
};

export const buildRiskScores = (overrides: Partial<RiskScore>): RiskScore => {
  return {
    ...defaultRiskScores,
    ...overrides,
  };
};
