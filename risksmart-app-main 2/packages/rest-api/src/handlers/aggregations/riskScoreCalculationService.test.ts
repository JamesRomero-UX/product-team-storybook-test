import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  recalculateRiskScoresByTier,
  recalculateTierThreeRiskScoresByRiskId,
} from './calculators';
import type { ModelConfig } from './models/types';
import type { RatingCategories } from './ratingCategories';
import { recalculateAllRiskScoresForAggregationBasedModels } from './riskScoreCalculationService';
import { upsertScores } from './upsertScores';

vi.mock('src/services/risk/riskService');
vi.mock('./calculators');
vi.mock('./upsertScores');
vi.mock('src/services/aggregation/aggregationService');

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    deleteRiskScoresForOrg: vi.fn(),
    getTierThreeRisks: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const calculateControlEffectivenessMock = vi.fn();
const calculateInherentRatingMock = vi.fn();
const calculateResidualRatingMock = vi.fn();

const recalculateTierThreeRiskScoresByRiskIdMock = vi.mocked(
  recalculateTierThreeRiskScoresByRiskId
);
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));

const recalculateRiskScoresByTierMock = vi.mocked(recalculateRiskScoresByTier);
const upsertScoresMock = vi.mocked(upsertScores);

const deleteRiskScoresForOrgMock = vi.mocked(apiClient.deleteRiskScoresForOrg);
const getTierThreeRisksMock = vi.mocked(apiClient.getTierThreeRisks);

describe('recalculateAllRiskScores', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should wipe existing data and recalculate scores tier by tier', async () => {
    getTierThreeRisksMock.mockResolvedValueOnce({
      risk: [
        { Id: '1', OrgKey: 'org-key' },
        { Id: '2', OrgKey: 'org-key' },
        { Id: '3', OrgKey: 'org-key' },
      ],
    });
    const mockModel: ModelConfig<null> = {
      requiresAggregation: true,
      calculateControlEffectiveness: calculateControlEffectivenessMock,
      calculateInherentScore: calculateInherentRatingMock,
      calculateResidualScore: calculateResidualRatingMock,
      calculateResidualRating: vi.fn(),
      calculateInherentRating: vi.fn(),
    };

    const mockRatingCategories: RatingCategories = {
      inherentRatingCategories: [],
      residualRatingCategories: [],
    };

    await recalculateAllRiskScoresForAggregationBasedModels(
      'org-key',
      hasuraMock,
      mockModel,
      null,
      mockRatingCategories
    );

    expect(deleteRiskScoresForOrgMock).toHaveBeenCalledWith({
      OrgKey: 'org-key',
    });

    expect(recalculateTierThreeRiskScoresByRiskIdMock).toHaveBeenCalledTimes(3);
    expect(recalculateRiskScoresByTierMock).toHaveBeenNthCalledWith(1, {
      hasuraClient: hasuraMock,
      orgKey: 'org-key',
      tier: 2,
      model: mockModel,
      ratingCategories: mockRatingCategories,
    });
    expect(recalculateRiskScoresByTierMock).toHaveBeenNthCalledWith(2, {
      hasuraClient: hasuraMock,
      orgKey: 'org-key',
      tier: 1,
      model: mockModel,
      ratingCategories: mockRatingCategories,
    });
    // 3 for tier 3, 1 for tier 2, 1 for tier 1
    expect(upsertScoresMock).toHaveBeenCalledTimes(5);
  });
});
