import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type {
  AssessmentResultParent,
  ControlParent,
  GetRiskScoreDataQuery,
  Risk,
  TestResult,
} from 'generated/graphql';
import { ParentTypeEnum, RiskScoringModelEnum } from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getTestResultByIdWithParents } from '../../services/test-result/testResultService';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handleControlUpdate } from './handlers/controlUpdateHandler';
import type { ModelConfig } from './models/types';
import type { RatingCategories } from './ratingCategories';
import { handler } from './riskScore';
import type {
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
} from './types';

vi.mock('src/services/aggregation/aggregationService');
vi.mock('src/backendGraphqlClient');
vi.mock('src/adminGraphqlClient');
vi.mock('src/services/risk/riskService');
vi.mock('src/services/test-result/testResultService');
vi.mock('./enterpriseRiskScore');

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const calculateControlEffectivenessMock = vi.fn();
const calculateInherentScoreMock = vi.fn<CalculateInherentScoreFn<null>>();
const calculateResidualScoreMock = vi.fn<CalculateResidualScoreFn>();

const getTestResultByIdWithParentsMock = vi.mocked(
  getTestResultByIdWithParents
);

type ScoreRisk = GetRiskScoreDataQuery['risk'][number];

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    upsertRiskScores: vi.fn(),
    getAncestorRiskScoresByTier3RiskId: vi.fn(),
    getRiskScoreData: vi.fn(),
    getAggregationSettingsForOrg: vi.fn(),
    getTaxonomyByLocaleAndOrg: vi.fn(),
    getLatestRiskAssessmentResultConfig: vi.fn(),
    getLatestRiskAssessmentResultConfigByOrg: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));

const getAggregationSettingsForOrgMock = vi.mocked(
  apiClient.getAggregationSettingsForOrg
);
const upsertRiskScoresMock = vi.mocked(apiClient.upsertRiskScores);
const getAncestorRiskScoresByTier3RiskIdMock = vi.mocked(
  apiClient.getAncestorRiskScoresByTier3RiskId
);

const getRiskScoreDataMock = vi.mocked(apiClient.getRiskScoreData);
const getTaxonomyByLocaleAndOrgMock = vi.mocked(
  apiClient.getTaxonomyByLocaleAndOrg
);
const getLatestRiskAssessmentResultConfigByOrgMock = vi.mocked(
  apiClient.getLatestRiskAssessmentResultConfigByOrg
);

describe('Risk Score Aggregation', () => {
  describe('aggregator', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      getTaxonomyByLocaleAndOrgMock.mockResolvedValue({ taxonomy: [] });
      getLatestRiskAssessmentResultConfigByOrgMock.mockResolvedValue({
        risk_assessment_result_config: [],
      });
    });

    it('should terminate when test result has non assessment or control parents', async () => {
      getAggregationSettingsForOrgMock.mockResolvedValueOnce({
        aggregation_org: [
          {
            OrgKey: 'org-key',
            RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
          },
        ],
      });
      getTestResultByIdWithParentsMock.mockResolvedValueOnce([
        {
          Id: '123',
          TestDate: '',
          assessmentParents: [
            {
              ParentType: ParentTypeEnum.InternalAuditReport,
            },
            {
              ParentType: ParentTypeEnum.Control,
            },
          ],
        },
      ]);

      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<TestResult, 'test_result'>
            | DataChangeEvent<
                AssessmentResultParent,
                'assessment_result_parent'
              >
          >
        >({
          detail: {
            table: { name: 'test_result' },
            event: {
              session_variables: {},
              op: 'INSERT',
              data: {
                new: {
                  Id: '123',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(getRiskScoreDataMock).not.toHaveBeenCalled();
      expect(getTestResultByIdWithParentsMock).toHaveBeenCalled();
    });

    it('should process when test result has control parents', async () => {
      upsertRiskScoresMock.mockResolvedValue({
        insert_risk_score: {
          affected_rows: 0,
        },
      });
      getAggregationSettingsForOrgMock.mockResolvedValueOnce({
        aggregation_org: [
          {
            OrgKey: 'org-key',
            RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
          },
        ],
      });
      getTestResultByIdWithParentsMock.mockResolvedValueOnce([
        {
          Id: '123',
          TestDate: '',
          assessmentParents: [
            {
              ParentType: ParentTypeEnum.Control,
            },
          ],
        },
      ]);
      getRiskScoreDataMock.mockResolvedValue({
        risk: [
          stub<ScoreRisk>({
            Id: 'risk-id-1',
            controls: [stub<ControlParent>({})],
          }),
          stub<ScoreRisk>({
            Id: 'risk-id-2',
            controls: [stub<ControlParent>({}), stub<ControlParent>({})],
          }),
          stub<ScoreRisk>({
            Id: 'risk-id-3',
            controls: [
              stub<ControlParent>({}),
              stub<ControlParent>({}),
              stub<ControlParent>({}),
            ],
          }),
        ],
      });
      getAncestorRiskScoresByTier3RiskIdMock.mockImplementation((variables) => {
        if (variables.RiskId === 'risk-id-1') {
          return Promise.resolve({
            tier2: [
              stub<Risk>({
                Id: 'ancestor-risk-id-1',
                childRisks: [
                  {
                    Id: 'risk-id-1',
                    // @ts-ignore
                    riskScore: { ResidualScore: 7.5, InherentScore: 10 },
                  },
                ],
              }),
            ],
            tier1: [
              stub<Risk>({
                Id: 'ancestor-risk-id-3',
                childRisks: [
                  {
                    Id: 'ancestor-risk-id-1',
                    // @ts-ignore
                    riskScore: { ResidualScore: 7.2, InherentScore: 10 },
                  },
                ],
              }),
            ],
          });
        }
        if (variables.RiskId === 'risk-id-2') {
          return Promise.resolve({
            tier2: [],
            tier1: [],
          });
        }
        if (variables.RiskId === 'risk-id-3') {
          return Promise.resolve({
            tier2: [],
            tier1: [],
          });
        }

        return Promise.resolve({ tier1: [], tier2: [] });
      });
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<TestResult, 'test_result'>
            | DataChangeEvent<
                AssessmentResultParent,
                'assessment_result_parent'
              >
          >
        >({
          detail: {
            table: { name: 'test_result' },
            event: {
              session_variables: {},
              op: 'INSERT',
              data: {
                new: {
                  Id: '123',
                  ParentControlId: 'parent-control-id',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(getRiskScoreDataMock).toHaveBeenCalled();
      expect(getTestResultByIdWithParentsMock).toHaveBeenCalled();
    });

    it('should process when test result has control and assessment parents', async () => {
      upsertRiskScoresMock.mockResolvedValue({
        insert_risk_score: {
          affected_rows: 0,
        },
      });
      getAggregationSettingsForOrgMock.mockResolvedValueOnce({
        aggregation_org: [
          {
            OrgKey: 'org-key',
            RiskScoringModel: RiskScoringModelEnum.ControlEffectivenessAverages,
          },
        ],
      });
      getTestResultByIdWithParentsMock.mockResolvedValueOnce([
        {
          Id: '123',
          TestDate: '',
          assessmentParents: [
            {
              ParentType: ParentTypeEnum.Control,
            },
            {
              ParentType: ParentTypeEnum.Assessment,
            },
          ],
        },
      ]);
      getRiskScoreDataMock.mockResolvedValue({
        risk: [
          stub<ScoreRisk>({
            Id: 'risk-id-1',
            controls: [stub<ControlParent>({})],
          }),
          stub<ScoreRisk>({
            Id: 'risk-id-2',
            controls: [stub<ControlParent>({}), stub<ControlParent>({})],
          }),
          stub<ScoreRisk>({
            Id: 'risk-id-3',
            controls: [
              stub<ControlParent>({}),
              stub<ControlParent>({}),
              stub<ControlParent>({}),
            ],
          }),
        ],
      });
      getAncestorRiskScoresByTier3RiskIdMock.mockImplementation((variables) => {
        if (variables.RiskId === 'risk-id-1') {
          return Promise.resolve({
            tier2: [
              stub<Risk>({
                Id: 'ancestor-risk-id-1',
                childRisks: [
                  {
                    Id: 'risk-id-1',
                    // @ts-ignore
                    riskScore: { ResidualScore: 7.5, InherentScore: 10 },
                  },
                ],
              }),
            ],
            tier1: [
              stub<Risk>({
                Id: 'ancestor-risk-id-3',
                childRisks: [
                  {
                    Id: 'ancestor-risk-id-1',
                    // @ts-ignore
                    riskScore: { ResidualScore: 7.2, InherentScore: 10 },
                  },
                ],
              }),
            ],
          });
        }
        if (variables.RiskId === 'risk-id-2') {
          return Promise.resolve({
            tier2: [],
            tier1: [],
          });
        }
        if (variables.RiskId === 'risk-id-3') {
          return Promise.resolve({
            tier2: [],
            tier1: [],
          });
        }

        return Promise.resolve({ tier1: [], tier2: [] });
      });
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<TestResult, 'test_result'>
            | DataChangeEvent<
                AssessmentResultParent,
                'assessment_result_parent'
              >
          >
        >({
          detail: {
            table: { name: 'test_result' },
            event: {
              session_variables: {},
              op: 'INSERT',
              data: {
                new: {
                  Id: '123',
                  ParentControlId: 'parent-control-id',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(getRiskScoreDataMock).toHaveBeenCalled();
      expect(getTestResultByIdWithParentsMock).toHaveBeenCalled();
    });
  });

  // eslint-disable-next-line vitest/no-disabled-tests
  describe.skip('handleControlParentUpdate', () => {
    describe('controlEffectivenessAverages', () => {
      beforeEach(() => {
        vi.resetAllMocks();
      });
    });
  });

  describe('handleTestResultUpdate', () => {
    describe('controlEffectivenessAverages', () => {
      beforeEach(() => {
        vi.resetAllMocks();
      });

      it('calculates risk scores for all risks in the hierarchy', async () => {
        upsertRiskScoresMock.mockResolvedValue({
          insert_risk_score: {
            affected_rows: 0,
          },
        });
        getRiskScoreDataMock.mockResolvedValue({
          risk: [
            stub<ScoreRisk>({
              Id: 'risk-id-1',
              controls: [stub<ControlParent>({})],
              inherentAssessmentResults: [],
              residualAssessmentResults: [],
            }),
            stub<ScoreRisk>({
              Id: 'risk-id-2',
              controls: [stub<ControlParent>({}), stub<ControlParent>({})],
              inherentAssessmentResults: [],
              residualAssessmentResults: [],
            }),
            stub<ScoreRisk>({
              Id: 'risk-id-3',
              controls: [
                stub<ControlParent>({}),
                stub<ControlParent>({}),
                stub<ControlParent>({}),
              ],
              inherentAssessmentResults: [],
              residualAssessmentResults: [],
            }),
          ],
        });
        getAncestorRiskScoresByTier3RiskIdMock.mockImplementation(
          (variables) => {
            if (variables.RiskId === 'risk-id-1') {
              return Promise.resolve({
                tier2: [
                  stub<Risk>({
                    Id: 'ancestor-risk-id-1',
                    childRisks: [
                      {
                        Id: 'risk-id-1',
                        // @ts-ignore
                        riskScore: { ResidualScore: 7.5, InherentScore: 10 },
                      },
                      {
                        Id: 'risk-id-5',
                        // @ts-ignore
                        riskScore: { ResidualScore: 6.3, InherentScore: 16 },
                      },
                      {
                        Id: 'risk-id-6',
                        // @ts-ignore
                        riskScore: { ResidualScore: 9.1, InherentScore: 20 },
                      },
                    ],
                  }),
                ],
                tier1: [
                  stub<Risk>({
                    Id: 'ancestor-risk-id-3',
                    childRisks: [
                      {
                        Id: 'ancestor-risk-id-1',
                        // @ts-ignore
                        riskScore: { ResidualScore: 7.2, InherentScore: 10 }, // old value, will be ignored and replaced
                      },
                      {
                        Id: 'ancestor-risk-id-2',
                        // @ts-ignore
                        riskScore: { ResidualScore: 6.1, InherentScore: 10 },
                      },
                    ],
                  }),
                ],
              });
            }
            if (variables.RiskId === 'risk-id-2') {
              return Promise.resolve({
                tier2: [],
                tier1: [],
              });
            }
            if (variables.RiskId === 'risk-id-3') {
              return Promise.resolve({
                tier2: [],
                tier1: [],
              });
            }

            return Promise.resolve({ tier1: [], tier2: [] });
          }
        );
        calculateInherentScoreMock.mockImplementation(({ riskId }) => {
          switch (riskId) {
            case 'risk-id-1':
              return { score: 10, impact: 2, likelihood: 5 };
            case 'risk-id-2':
              return { score: 8, impact: 2, likelihood: 4 };
            case 'risk-id-3':
              return { score: 9, impact: 3, likelihood: 3 };
            default:
              return null;
          }
        });
        calculateControlEffectivenessMock.mockImplementation(({ controls }) => {
          if (controls.length === 1) {
            return { overallMitigation: 0.75 };
          }
          if (controls.length === 2) {
            return { overallMitigation: 0.95 };
          }
          if (controls.length === 3) {
            return { overallMitigation: 0.45 };
          }
        });
        calculateResidualScoreMock.mockImplementation(
          ({ inherentScore, controlEffectiveness }) => {
            if (!inherentScore || !controlEffectiveness) {
              throw new Error(
                'Missing inherent score or control effectiveness'
              );
            }

            return (
              inherentScore?.score * controlEffectiveness?.overallMitigation
            );
          }
        );

        const mockModel: ModelConfig<null> = {
          requiresAggregation: true,
          calculateControlEffectiveness: calculateControlEffectivenessMock,
          calculateInherentScore: calculateInherentScoreMock,
          calculateResidualScore: calculateResidualScoreMock,
          calculateResidualRating: vi.fn(),
          calculateInherentRating: vi.fn(),
        };

        const mockRatingCategories: RatingCategories = {
          inherentRatingCategories: [],
          residualRatingCategories: [],
        };

        await handleControlUpdate(
          hasuraMock,
          'test-result-id',
          'UPDATE',
          mockModel,
          null,
          'org-key',
          mockRatingCategories
        );

        expect(upsertRiskScoresMock).toHaveBeenNthCalledWith(1, {
          scores: [
            expect.objectContaining({
              RiskId: 'risk-id-1',
              ResidualScore: 7.5,
              InherentScore: 10,
              OrgKey: 'org-key',
            }),
            expect.objectContaining({
              RiskId: 'risk-id-2',
              ResidualScore: 7.6,
              InherentScore: 8,
              OrgKey: 'org-key',
            }),
            expect.objectContaining({
              RiskId: 'risk-id-3',
              ResidualScore: 4.05,
              InherentScore: 9,
              OrgKey: 'org-key',
            }),
          ],
        });
        expect(upsertRiskScoresMock).toHaveBeenNthCalledWith(2, {
          scores: [
            expect.objectContaining({
              RiskId: 'ancestor-risk-id-1',
              ResidualScore: 7.633333333333333,
              InherentScore: 15.333333333333334,
              OrgKey: 'org-key',
            }),
            expect.objectContaining({
              RiskId: 'ancestor-risk-id-3',
              ResidualScore: 6.866666666666666,
              InherentScore: 12.666666666666668,
              OrgKey: 'org-key',
            }),
          ],
        });
      });
    });
  });
});
