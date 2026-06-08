import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type {
  DocumentAssessmentResult,
  ObligationAssessmentResult,
  RiskAssessmentResult,
} from 'generated/graphql';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import {
  getDocumentAssessmentResult,
  getObligationAssessmentResult,
  getRiskAssessmentResult,
} from 'src/services/assessment-result/assessmentResultService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getHasuraBackendClient } from '../../../backendGraphqlClient';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
import { handler } from './ratingUpdateScheduleRecalculate';

const mockRefreshRiskRatingScheduleState = vi.fn();
const mockRefreshDocumentScheduleState = vi.fn();
const mockRefreshObligationScheduleState = vi.fn();

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/riskService');
vi.mock('src/adminGraphqlClient');
vi.mock('src/adapters/create-schedule-refresh', () => ({
  createScheduleRefresh: vi.fn(() => ({
    ctx: { tenant: 'test-tenant', orgKey: 'test-org', userId: 'test-user' },
    refreshRiskRatingScheduleState: mockRefreshRiskRatingScheduleState,
    refreshDocumentScheduleState: mockRefreshDocumentScheduleState,
    refreshObligationScheduleState: mockRefreshObligationScheduleState,
  })),
}));
vi.mock('src/services/assessment-result/assessmentResultService');
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientMock = vi.mocked(getHasuraBackendClient);

const getDocumentAssessmentResultMock = vi.mocked(getDocumentAssessmentResult);
const getObligationAssessmentResultMock = vi.mocked(
  getObligationAssessmentResult
);
const getRiskAssessmentResultMock = vi.mocked(getRiskAssessmentResult);

describe('Rating Update Schedule Recalculate', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      getHasuraBackendClientMock.mockReturnValue(hasuraMock);
    });

    it('should handle risk updates', async () => {
      getRiskAssessmentResultMock.mockResolvedValue([
        {
          Id: 'risk-assessment-result-id-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          RatingType: 'risk',
          parents: [
            {
              ParentType: ParentTypeEnum.Risk,
              risk: {
                Id: 'risk-id-1',
              },
            },
          ],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'risk_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'risk-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).toHaveBeenCalledWith(
        expect.objectContaining({ tenant: expect.any(String) }),
        'risk-id-1'
      );
    });

    it('should handle updates where risk assessment result does not return', async () => {
      getRiskAssessmentResultMock.mockResolvedValue([]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'risk_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'risk-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle risk assessment updates where parents has values but no risks', async () => {
      getRiskAssessmentResultMock.mockResolvedValue([
        {
          Id: 'risk-assessment-result-id-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          RatingType: 'risk',
          parents: [
            {
              ParentType: ParentTypeEnum.Assessment,
            },
          ],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'risk_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'risk-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle risk assessment updates where parents is empty', async () => {
      getRiskAssessmentResultMock.mockResolvedValue([
        {
          Id: 'risk-assessment-result-id-1',
          ControlType: RiskAssessmentResultControlTypeEnum.Uncontrolled,
          RatingType: 'risk',
          parents: [],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'risk_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'risk-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle obligation updates', async () => {
      getObligationAssessmentResultMock.mockResolvedValue([
        {
          Id: 'obligation-assessment-result-id-1',
          parents: [
            {
              obligation: {
                Id: 'risk-id-1',
              },
            },
          ],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'obligation_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'obligation-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).toHaveBeenCalledWith(
        expect.objectContaining({ tenant: expect.any(String) }),
        'risk-id-1'
      );
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle updates where obligation assessment result does not return', async () => {
      getObligationAssessmentResultMock.mockResolvedValue([]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'obligation_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'obligation-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle obligation assessment updates where parents has values but no obligations', async () => {
      getObligationAssessmentResultMock.mockResolvedValue([
        {
          Id: 'obligation-assessment-result-id-1',
          parents: [{}],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'obligation_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'obligation-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle obligation assessment updates where parents is empty', async () => {
      getObligationAssessmentResultMock.mockResolvedValue([
        {
          Id: 'obligation-assessment-result-id-1',
          parents: [],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'obligation_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'obligation-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle document updates', async () => {
      getDocumentAssessmentResultMock.mockResolvedValue([
        {
          Id: 'document-assessment-result-id-1',
          parents: [
            {
              document: {
                Id: 'risk-id-1',
              },
            },
          ],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'document_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'document-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).toHaveBeenCalledWith(
        expect.objectContaining({ tenant: expect.any(String) }),
        'risk-id-1'
      );
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle updates where document assessment result does not return', async () => {
      getDocumentAssessmentResultMock.mockResolvedValue([]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'document_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'document-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle document assessment updates where parents has values but no document', async () => {
      getDocumentAssessmentResultMock.mockResolvedValue([
        {
          Id: 'document-assessment-result-id-1',
          parents: [{}],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'document_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'document-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle document assessment updates where parents is empty', async () => {
      getDocumentAssessmentResultMock.mockResolvedValue([
        {
          Id: 'document-assessment-result-id-1',
          parents: [],
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            string,
            | DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
            | DataChangeEvent<
                DocumentAssessmentResult,
                'document_assessment_result'
              >
            | DataChangeEvent<
                ObligationAssessmentResult,
                'obligation_assessment_result'
              >
          >
        >({
          detail: {
            table: { name: 'document_assessment_result' },
            event: {
              data: {
                new: {
                  Id: 'document-assessment-result-id-1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(mockRefreshDocumentScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });
  });
});
