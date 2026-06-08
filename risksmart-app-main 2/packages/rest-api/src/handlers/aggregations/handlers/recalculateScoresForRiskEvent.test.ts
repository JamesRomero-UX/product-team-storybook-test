import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  recalculateAncestorScores,
  recalculateTierThreeRiskScoresByRiskId,
} from '../calculators';
import type { ModelConfig } from '../models/types';
import type { RatingCategories } from '../ratingCategories';
import { recalculateAllRiskScoresForAggregationBasedModels } from '../riskScoreCalculationService';
import type {
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
  RiskScoreForInsert,
} from '../types';
import { upsertScores } from '../upsertScores';
import { recalculateScoresForRiskEvent } from './recalculateScoresForRiskEvent';

vi.mock('src/services/aggregation/aggregationService');
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/risk/riskService');
vi.mock('../calculators');
vi.mock('../upsertScores');
vi.mock('../riskScoreCalculationService');

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const calculateControlEffectivenessMock = vi.fn();
const calculateInherentScoreMock = vi.fn<CalculateInherentScoreFn<null>>();
const calculateResidualScoreMock = vi.fn<CalculateResidualScoreFn>();
const recalculateAncestorScoresMock = vi.mocked(recalculateAncestorScores);
const recalculateAllRiskScoresMock = vi.mocked(
  recalculateAllRiskScoresForAggregationBasedModels
);
const upsertScoresMock = vi.mocked(upsertScores);
const recalculateTierThreeRiskScoresByRiskIdMockMock = vi.mocked(
  recalculateTierThreeRiskScoresByRiskId
);
vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    upsertRiskScores: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));
const upsertRiskScoresMock = vi.mocked(apiClient.upsertRiskScores);
const mockRatingCategories: RatingCategories = {
  inherentRatingCategories: [
    { label: 'Low', value: 1, range: [0, 4] },
    { label: 'Medium', value: 2, range: [4, 8] },
    { label: 'High', value: 3, range: [8, 12] },
  ],
  residualRatingCategories: [
    { label: 'Low', value: 1, range: [0, 4] },
    { label: 'Medium', value: 2, range: [4, 8] },
    { label: 'High', value: 3, range: [8, 12] },
  ],
};

const mockModel: ModelConfig<null> = {
  requiresAggregation: true,
  calculateControlEffectiveness: calculateControlEffectivenessMock,
  calculateInherentScore: calculateInherentScoreMock,
  calculateResidualScore: calculateResidualScoreMock,
  calculateResidualRating: vi.fn(),
  calculateInherentRating: vi.fn(),
};

describe('riskUpdateHandler', () => {
  describe('INSERT', async () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when risk is tier one', async () => {
      const newRisk = {
        Id: '1',
        Tier: 1,
        ParentRiskId: '2',
      };
      const oldRisk = newRisk;

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'INSERT' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(upsertRiskScoresMock).not.toHaveBeenCalled();
      expect(recalculateAncestorScoresMock).not.toHaveBeenCalled();
      expect(upsertScoresMock).not.toHaveBeenCalled();
      expect(
        recalculateTierThreeRiskScoresByRiskIdMockMock
      ).not.toHaveBeenCalled();
    });

    it('throws error when parent risk id is missing', async () => {
      const newRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: null,
      };
      const oldRisk = newRisk;

      await expect(
        recalculateScoresForRiskEvent(
          hasuraMock,
          { newRisk, oldRisk, op: 'INSERT' },
          mockModel,
          null,
          'orgKey',
          mockRatingCategories
        )
      ).rejects.toThrow('missing parent risk id');
    });

    it('clears parent score when risk is not tier one', async () => {
      const newRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '2',
      };
      const oldRisk = newRisk;

      const scores: RiskScoreForInsert[] = [
        {
          RiskId: '2',
          InherentScore: null,
          ResidualScore: null,
          InherentRating: null,
          ResidualRating: null,
          ResidualImpact: null,
          ResidualLikelihood: null,
          InherentImpact: null,
          InherentLikelihood: null,
        },
      ];
      recalculateAncestorScoresMock.mockResolvedValueOnce(scores);

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'INSERT' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(upsertRiskScoresMock).not.toHaveBeenCalled();
      expect(
        recalculateTierThreeRiskScoresByRiskIdMockMock
      ).not.toHaveBeenCalled();

      expect(recalculateAncestorScoresMock).toHaveBeenCalledWith(
        hasuraMock,
        [{ riskId: newRisk.ParentRiskId }],
        mockModel,
        mockRatingCategories
      );
      expect(upsertScoresMock).toHaveBeenCalledWith(
        hasuraMock,
        scores,
        'orgKey'
      );
    });
  });

  describe('DELETE', async () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when deleted risk is tier one', async () => {
      const newRisk = {
        Id: '1',
        Tier: 1,
        ParentRiskId: '2',
      };
      const oldRisk = newRisk;

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'DELETE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(upsertRiskScoresMock).not.toHaveBeenCalled();
      expect(recalculateAncestorScoresMock).not.toHaveBeenCalled();
      expect(upsertScoresMock).not.toHaveBeenCalled();
      expect(
        recalculateTierThreeRiskScoresByRiskIdMockMock
      ).not.toHaveBeenCalled();
    });

    it('does nothing when deleted risk does not have a parent', async () => {
      const oldRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: null,
      };
      const newRisk = oldRisk;

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'DELETE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(upsertRiskScoresMock).not.toHaveBeenCalled();
      expect(recalculateAncestorScoresMock).not.toHaveBeenCalled();
      expect(upsertScoresMock).not.toHaveBeenCalled();
      expect(
        recalculateTierThreeRiskScoresByRiskIdMockMock
      ).not.toHaveBeenCalled();
    });

    it('recalculates parent score when deleted risk is not tier one', async () => {
      const newRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '2',
      };
      const oldRisk = newRisk;

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'DELETE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(recalculateAllRiskScoresMock).toHaveBeenCalled();
    });
  });

  describe('UPDATE', async () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('does nothing when parent risk id is not changed', async () => {
      const newRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '2',
      };
      const oldRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '2',
      };

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'UPDATE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(upsertRiskScoresMock).not.toHaveBeenCalled();
      expect(recalculateAncestorScoresMock).not.toHaveBeenCalled();
      expect(upsertScoresMock).not.toHaveBeenCalled();
      expect(
        recalculateTierThreeRiskScoresByRiskIdMockMock
      ).not.toHaveBeenCalled();
      expect(recalculateAllRiskScoresMock).not.toHaveBeenCalled();
    });

    it('recalculates all scores when risk is tier three', async () => {
      const newRisk = {
        Id: '1',
        Tier: 3,
        ParentRiskId: '2',
      };
      const oldRisk = {
        Id: '1',
        Tier: 3,
        ParentRiskId: '3',
      };

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'UPDATE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(recalculateAllRiskScoresMock).toHaveBeenCalled();
    });

    it('recalculates scores for old and new parents when not tier three', async () => {
      const newRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '2',
      };
      const oldRisk = {
        Id: '1',
        Tier: 2,
        ParentRiskId: '3',
      };

      await recalculateScoresForRiskEvent(
        hasuraMock,
        { newRisk, oldRisk, op: 'UPDATE' },
        mockModel,
        null,
        'orgKey',
        mockRatingCategories
      );

      expect(recalculateAllRiskScoresMock).toHaveBeenCalled();
    });
  });
});
