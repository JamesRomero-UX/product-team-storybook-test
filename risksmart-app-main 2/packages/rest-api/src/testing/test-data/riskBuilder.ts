import type { GetRiskByIdQuery } from 'generated/graphql';

type Risk = GetRiskByIdQuery['risk'][number];
const defaultRisk: Risk = {
  Id: '1',
  Tier: 3,
  SequentialId: 1,
  Title: 'Hello',
};

export const buildRisk = (risk: Partial<Risk>): Risk => {
  return {
    ...defaultRisk,
    ...risk,
  };
};
