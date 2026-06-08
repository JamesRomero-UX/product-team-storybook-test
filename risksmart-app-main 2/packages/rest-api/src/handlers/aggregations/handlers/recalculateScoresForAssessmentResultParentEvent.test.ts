import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getRiskAssessmentResult } from 'src/services/assessment-result/assessmentResultService';
import { getRisk } from 'src/services/risk/riskService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import {
  recalculateAncestorScores,
  recalculateTierThreeRiskScoresByRiskId,
} from '../calculators';
import type { ModelConfig } from '../models/types';
import type { RatingCategories } from '../ratingCategories';
import type {
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
} from '../types';
import { upsertScores } from '../upsertScores';
import { recalculateScoresForRiskAssessmentParentEvent } from './recalculateScoresForAssessmentResultParentEvent';

vi.mock('src/services/aggregation/aggregationService');
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/risk/riskService');
vi.mock('src/services/assessment-result/assessmentResultService');
vi.mock('../calculators');
vi.mock('../upsertScores');

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const calculateControlEffectivenessMock = vi.fn();
const calculateInherentScoreMock = vi.fn<CalculateInherentScoreFn<null>>();
const calculateResidualScoreMock = vi.fn<CalculateResidualScoreFn>();
const recalculateAncestorScoresMock = vi.mocked(recalculateAncestorScores);
const upsertScoresMock = vi.mocked(upsertScores);
const getRiskAssessmentResultMock = vi.mocked(getRiskAssessmentResult);
const getRiskMock = vi.mocked(getRisk);
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

describe('assessmentResultUpdateHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockModel: ModelConfig<null> = {
    requiresAggregation: true,
    calculateControlEffectiveness: calculateControlEffectivenessMock,
    calculateInherentScore: calculateInherentScoreMock,
    calculateResidualScore: calculateResidualScoreMock,
    calculateResidualRating: vi.fn(),
    calculateInherentRating: vi.fn(),
  };

  it.each(['document', 'obligation'])(
    'does nothing when parent type is not risk (%s)',
    async (parentType) => {
      const assessmentResultParent = {
        ParentType: parentType as ParentTypeEnum,
        ParentId: '1',
        ResultType: ParentTypeEnum.RiskAssessmentResult,
        Id: '2',
      };

      await recalculateScoresForRiskAssessmentParentEvent(
        hasuraMock,
        assessmentResultParent,
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
      expect(getRiskAssessmentResultMock).not.toHaveBeenCalled();
    }
  );

  it.each(['document_assessment_result', 'obligation_assessment_result'])(
    'does nothing when result type is not risk_assessment_result (%s)',
    async (resultType) => {
      const assessmentResultParent = {
        ParentType: ParentTypeEnum.Risk,
        ParentId: '1',
        ResultType: resultType as ParentTypeEnum,
        Id: '2',
      };

      await recalculateScoresForRiskAssessmentParentEvent(
        hasuraMock,
        assessmentResultParent,
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
      expect(getRiskAssessmentResultMock).not.toHaveBeenCalled();
    }
  );

  it('does nothing when result is controlled', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        Id: '2',
        RatingType: 'rating',
        parents: [
          {
            ParentType: ParentTypeEnum.Risk,
          },
        ],
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
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

  it('does nothing when risk is not tier 3', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        Id: '2',
        RatingType: 'rating',
        parents: [
          {
            ParentType: ParentTypeEnum.Risk,
          },
        ],
      },
    ]);

    getRiskMock.mockResolvedValue([
      {
        Id: '1',
        Tier: 2,
        SequentialId: 1,
        Title: 'Hello',
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
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

  it('does nothing if assessment has internal audit report parent', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        Id: '2',
        RatingType: 'internal_audit_report',
        parents: [
          {
            ParentType: ParentTypeEnum.Risk,
          },
          {
            ParentType: ParentTypeEnum.InternalAuditReport,
          },
        ],
      },
    ]);

    getRiskMock.mockResolvedValue([
      {
        Id: '1',
        Tier: 3,
        SequentialId: 1,
        Title: 'Hello',
      },
    ]);

    recalculateTierThreeRiskScoresByRiskIdMockMock.mockResolvedValue([
      {
        RiskId: '1',
        InherentScore: 6,
        ResidualScore: 3,
        InherentRating: null,
        ResidualRating: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentImpact: null,
        InherentLikelihood: null,
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
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

  it('recalculates tier 3 risk scores when parent is a risk', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        Id: '2',
        RatingType: 'rating',
        parents: [
          {
            ParentType: ParentTypeEnum.Risk,
          },
        ],
      },
    ]);

    getRiskMock.mockResolvedValue([
      {
        Id: '1',
        Tier: 3,
        SequentialId: 1,
        Title: 'Hello',
      },
    ]);

    recalculateTierThreeRiskScoresByRiskIdMockMock.mockResolvedValue([
      {
        RiskId: '1',
        InherentScore: 6,
        ResidualScore: 3,
        InherentRating: null,
        ResidualRating: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentImpact: null,
        InherentLikelihood: null,
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
      mockModel,
      null,
      'orgKey',
      mockRatingCategories
    );

    expect(recalculateAncestorScoresMock).toHaveBeenCalledWith(
      hasuraMock,
      [{ riskId: '1', isTierThree: true }],
      mockModel,
      mockRatingCategories
    );
    expect(upsertScoresMock).toHaveBeenCalledTimes(2);
    expect(recalculateTierThreeRiskScoresByRiskIdMockMock).toHaveBeenCalled();
  });

  it('recalculates tier 3 risk scores when parent is risk and assessment', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        Id: '2',
        RatingType: 'assessment',
        parents: [
          {
            ParentType: ParentTypeEnum.Risk,
          },
          {
            ParentType: ParentTypeEnum.Assessment,
          },
        ],
      },
    ]);

    getRiskMock.mockResolvedValue([
      {
        Id: '1',
        Tier: 3,
        SequentialId: 1,
        Title: 'Hello',
      },
    ]);

    recalculateTierThreeRiskScoresByRiskIdMockMock.mockResolvedValue([
      {
        RiskId: '1',
        InherentScore: 6,
        ResidualScore: 3,
        InherentRating: null,
        ResidualRating: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentImpact: null,
        InherentLikelihood: null,
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
      mockModel,
      null,
      'orgKey',
      mockRatingCategories
    );

    expect(recalculateAncestorScoresMock).toHaveBeenCalledWith(
      hasuraMock,
      [{ riskId: '1', isTierThree: true }],
      mockModel,
      mockRatingCategories
    );
    expect(upsertScoresMock).toHaveBeenCalledTimes(2);
    expect(recalculateTierThreeRiskScoresByRiskIdMockMock).toHaveBeenCalled();
  });

  it('recalculates tier 3 risk scores when parents dont exist', async () => {
    const assessmentResultParent = {
      ParentType: ParentTypeEnum.Risk,
      ParentId: '1',
      ResultType: ParentTypeEnum.RiskAssessmentResult,
      Id: '2',
    };

    getRiskAssessmentResultMock.mockResolvedValue([
      {
        ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
        Id: '2',
        RatingType: 'rating',
        parents: [],
      },
    ]);

    getRiskMock.mockResolvedValue([
      {
        Id: '1',
        Tier: 3,
        SequentialId: 1,
        Title: 'Hello',
      },
    ]);

    recalculateTierThreeRiskScoresByRiskIdMockMock.mockResolvedValue([
      {
        RiskId: '1',
        InherentScore: 6,
        ResidualScore: 3,
        InherentRating: null,
        ResidualRating: null,
        ResidualImpact: null,
        ResidualLikelihood: null,
        InherentImpact: null,
        InherentLikelihood: null,
      },
    ]);

    await recalculateScoresForRiskAssessmentParentEvent(
      hasuraMock,
      assessmentResultParent,
      mockModel,
      null,
      'orgKey',
      mockRatingCategories
    );

    expect(recalculateAncestorScoresMock).toHaveBeenCalledWith(
      hasuraMock,
      [{ riskId: '1', isTierThree: true }],
      mockModel,
      mockRatingCategories
    );
    expect(upsertScoresMock).toHaveBeenCalledTimes(2);
    expect(recalculateTierThreeRiskScoresByRiskIdMockMock).toHaveBeenCalled();
  });
});
