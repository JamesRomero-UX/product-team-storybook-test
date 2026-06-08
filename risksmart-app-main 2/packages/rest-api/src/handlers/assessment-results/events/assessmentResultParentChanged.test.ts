import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { AssessmentResultParent } from 'generated/graphql';
import { ParentTypeEnum } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { DataChangeEvent } from '../../events/DataChangeEvent';
import { handler } from './assessmentResultParentChanged';

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

describe('Assessment Result Parent Changed', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should terminate when assessment result parent aggregation model is invalid: missing resultType', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ParentType: ParentTypeEnum.Risk,
                  ParentId: '2',
                  OrgKey: 'org-id',
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

    it('should terminate when assessment result parent aggregation model is invalid: missing parentType', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  ParentId: '2',
                  OrgKey: 'org-id',
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

    it('should terminate when assessment result parent aggregation model is invalid: missing parentId', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  ParentType: ParentTypeEnum.Risk,
                  OrgKey: 'org-id',
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

    it('should handle risk deletes', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                  ParentType: ParentTypeEnum.Risk,
                  ParentId: '2',
                  OrgKey: 'org-id',
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
        '2'
      );
    });

    it('should handle obligation deletes', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
                  ParentType: ParentTypeEnum.Obligation,
                  ParentId: '2',
                  OrgKey: 'org-id',
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
        '2'
      );
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });

    it('should handle document deletes', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<AssessmentResultParent, 'assessment_result_parent'>
          >
        >({
          detail: {
            table: { name: 'assessment_result_parent' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  Id: '1',
                  ResultType: ParentTypeEnum.DocumentAssessmentResult,
                  ParentType: ParentTypeEnum.Document,
                  ParentId: '2',
                  OrgKey: 'org-id',
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
        '2'
      );
      expect(mockRefreshObligationScheduleState).not.toHaveBeenCalled();
      expect(mockRefreshRiskRatingScheduleState).not.toHaveBeenCalled();
    });
  });
});
