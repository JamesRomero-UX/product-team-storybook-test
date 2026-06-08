import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { ResultOf } from '@graphql-typed-document-node/core';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { GetRiskAssessmentResultByIdDocument } from 'generated/graphql';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { RiskAssessmentResultConfigRepository } from 'src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository';
import {
  getRiskAssessmentResult,
  updateRiskAssessmentResult,
} from 'src/services/assessment-result/assessmentResultService';
import { stub } from 'src/testing/stub';
import { NIL } from 'uuid';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { z } from 'zod';

import type { UpdateRiskAssessmentResultSchema } from './schema';
import { handler } from './updateRiskAssessmentResult';
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/assessment-result/assessmentResultService');
vi.mock(
  'src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository'
);

const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getRiskAssessmentResultMock = vi.mocked(getRiskAssessmentResult);
const updateRiskAssessmentResultMock = vi.mocked(updateRiskAssessmentResult);
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const riskAssessmentResultConfigRepositoryMock = vi.mocked(
  RiskAssessmentResultConfigRepository
);

type BuildEventInputWithImpact = Partial<
  z.infer<typeof UpdateRiskAssessmentResultSchema>
> & {
  Id: string;
};

type BuildEventInputWithImpacts = Omit<
  BuildEventInputWithImpact,
  'Impact' | 'Impacts'
> & {
  Impact?: undefined;
  Impacts: { Label: string; Value: number }[];
};

const buildEvent = (input: BuildEventInputWithImpact) => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {
        Rating: 3,
        Impact: 2,
        Likelihood: 1,
        Rationale: 'some rationale',
        TestDate: '2024-06-04',
        ...input,
      },
      session_variables: {
        'x-hasura-user-id': '1',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });
};

const buildEventWithImpacts = (input: BuildEventInputWithImpacts) => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {
        Rating: 3,
        Likelihood: 1,
        Rationale: 'some rationale',
        TestDate: '2024-06-04',
        ...input,
      },
      session_variables: {
        'x-hasura-user-id': '1',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });
};

const buildRiskAssessmentResult = (
  id: string,
  ratingType: string = 'rating'
): ResultOf<typeof GetRiskAssessmentResultByIdDocument> => ({
  risk_assessment_result: [
    {
      Id: id,
      ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      RatingType: ratingType,
      parents: [],
    },
  ],
});

describe('update risk rating assessment result - put', () => {
  const riskAssessmentResultId = '57c7b224-d865-4829-a7f5-98f36a7c1047';
  const assessmentId = '4a800371-6299-4fb7-84f9-e0ea838e12f7';

  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
    updateRiskAssessmentResultMock.mockResolvedValue(1);
  });

  describe('request validation', () => {
    it('should validate the post body', async () => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({}),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(400);
    });

    it('should return not found when risk assessment result does not exist', async () => {
      getRiskAssessmentResultMock.mockResolvedValue([]);

      const result = await handler(
        buildEvent({ Id: riskAssessmentResultId }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(404);
    });

    it.each([
      {
        ratingType: 'internal_audit_report',
        errorMessage:
          'Cannot associate an internal audit report result with an assessment',
      },
      {
        ratingType: 'compliance_monitoring_assessment',
        errorMessage:
          'Cannot associate a compliance monitoring result with an assessment',
      },
    ])(
      'should not allow a $ratingType assessment result to be assigned to an assessment',
      async ({ ratingType, errorMessage }) => {
        getRiskAssessmentResultMock.mockResolvedValue(
          buildRiskAssessmentResult(riskAssessmentResultId, ratingType)
            .risk_assessment_result
        );

        const result = await handler(
          buildEvent({
            Id: riskAssessmentResultId,
            AssessmentId: assessmentId,
          }),
          stub<Context>({})
        );

        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body!).message).toEqual(errorMessage);
      }
    );

    it('should throw error for unsupported rating type', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'unsupported_type')
          .risk_assessment_result
      );

      await expect(
        handler(buildEvent({ Id: riskAssessmentResultId }), stub<Context>({}))
      ).rejects.toThrow('Unsupported RatingType unsupported_type');
    });
  });

  describe('single impact', () => {
    it('should update risk assessment result with single impact', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'rating')
          .risk_assessment_result
      );

      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          Rating: 3,
          Impact: 2,
          Likelihood: 1,
          Rationale: 'updated rationale',
          TestDate: '2024-06-04',
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body!)).toEqual({ affected_rows: 1 });
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledTimes(1);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(hasuraMock, {
        Id: riskAssessmentResultId,
        CustomAttributeData: undefined,
        Impact: 2,
        Likelihood: 1,
        Rating: 3,
        Rationale: 'updated rationale',
        TestDate: '2024-06-04',
        AssessmentId: NIL,
        RatingType: 'rating',
        Parents: [],
        Impacts: [],
      });
    });

    it('should update risk assessment result with assessment', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'rating')
          .risk_assessment_result
      );

      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          AssessmentId: assessmentId,
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          AssessmentId: assessmentId,
          RatingType: 'assessment',
          Parents: [
            {
              ParentType: ParentTypeEnum.Assessment,
              ResultType: ParentTypeEnum.RiskAssessmentResult,
              ParentId: assessmentId,
              Id: riskAssessmentResultId,
            },
          ],
        })
      );
    });

    it('should change rating type from assessment to rating when assessment is removed', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'assessment')
          .risk_assessment_result
      );

      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          AssessmentId: null,
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          AssessmentId: NIL,
          RatingType: 'rating',
          Parents: [],
        })
      );
    });

    it('should preserve internal_audit_report rating type', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(
          riskAssessmentResultId,
          'internal_audit_report'
        ).risk_assessment_result
      );

      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          AssessmentId: null,
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          RatingType: 'internal_audit_report',
        })
      );
    });

    it('should preserve compliance_monitoring_assessment rating type', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(
          riskAssessmentResultId,
          'compliance_monitoring_assessment'
        ).risk_assessment_result
      );

      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          AssessmentId: null,
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          RatingType: 'compliance_monitoring_assessment',
        })
      );
    });

    it('should handle custom attribute data', async () => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'rating')
          .risk_assessment_result
      );

      const customData = { customField: 'custom value' };
      const result = await handler(
        buildEvent({
          Id: riskAssessmentResultId,
          CustomAttributeData: customData,
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          CustomAttributeData: customData,
        })
      );
    });
  });

  describe('multiple impacts', () => {
    beforeEach(() => {
      getRiskAssessmentResultMock.mockResolvedValue(
        buildRiskAssessmentResult(riskAssessmentResultId, 'rating')
          .risk_assessment_result
      );
    });

    it.each([
      {
        scenario: 'exact',
        impacts: [
          { Label: 'Financial', Value: 2 },
          { Label: 'Reputational', Value: 4 },
          { Label: 'Operational', Value: 6 },
        ],
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
          { name: 'Operational', color: 'purple' },
        ],
        expectedImpact: 4,
      },
      {
        scenario: 'rounds down',
        impacts: [
          { Label: 'Financial', Value: 1 },
          { Label: 'Reputational', Value: 3 },
          { Label: 'Operational', Value: 3 },
        ],
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
          { name: 'Operational', color: 'purple' },
        ],
        expectedImpact: 2,
      },
      {
        scenario: 'rounds up',
        impacts: [
          { Label: 'Financial', Value: 1 },
          { Label: 'Reputational', Value: 4 },
        ],
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
        ],
        expectedImpact: 3,
      },
    ])(
      'should calculate average impact ($scenario)',
      async ({ impacts, categories, expectedImpact }) => {
        riskAssessmentResultConfigRepositoryMock.mockReturnValue({
          getLatest: vi.fn().mockResolvedValue({
            impact: { aggregation: 'average', categories },
          }),
        });

        const result = await handler(
          buildEventWithImpacts({
            Id: riskAssessmentResultId,
            Impacts: [...impacts],
          }),
          stub<Context>({})
        );

        expect(result.statusCode).toEqual(200);
        expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
          hasuraMock,
          expect.objectContaining({
            Impact: expectedImpact,
          })
        );
      }
    );

    it('should calculate maximum impact', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'maximum',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
              { name: 'Operational', color: 'purple' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
            { Label: 'Operational', Value: 6 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(
        hasuraMock,
        expect.objectContaining({
          Impact: 6,
        })
      );
    });

    it('should update risk assessment result with impacts', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(updateRiskAssessmentResultMock).toHaveBeenCalledWith(hasuraMock, {
        Id: riskAssessmentResultId,
        Rating: 3,
        Impact: 3,
        Likelihood: 1,
        Rationale: 'some rationale',
        TestDate: '2024-06-04',
        CustomAttributeData: undefined,
        AssessmentId: NIL,
        RatingType: 'rating',
        Parents: [],
        Impacts: [
          {
            RiskAssessmentResultId: riskAssessmentResultId,
            Label: 'Financial',
            Value: 2,
          },
          {
            RiskAssessmentResultId: riskAssessmentResultId,
            Label: 'Reputational',
            Value: 4,
          },
        ],
      });
    });

    it('should return internal server error when no configuration is found', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue(undefined),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Failed to retrieve risk assessment result configuration',
        extensions: [],
      });
    });

    it('should return internal server error when unrecognised impact aggregation method configured', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'unknown',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Unrecognised impact aggregation method configured',
        extensions: [],
      });
    });

    it('should return bad request when impact count does not match category count', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
              { name: 'Operational', color: 'purple' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toEqual({
        message:
          'Expected 3 impacts to match configured categories, received 2',
        extensions: [],
      });
    });

    it('should succeed when no categories are configured and a single impact is provided', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [{ Label: 'Overall', Value: 3 }],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
    });

    it('should return bad request when no categories are configured and multiple impacts are provided', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [],
          },
        }),
      });

      const result = await handler(
        buildEventWithImpacts({
          Id: riskAssessmentResultId,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toEqual({
        message:
          'Expected 1 impact for single-impact configuration, received 2',
        extensions: [],
      });
    });
  });
});
