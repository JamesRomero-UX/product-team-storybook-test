import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { Indicator, Risk, RiskAssessmentResult } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { DataChangeEvent } from '../../events/DataChangeEvent';
import { controlNotifier, issueDueNotifier, riskNotifier } from '../index';
import { handler } from './notifier';

vi.mock('../index');
const riskNotifierMock = vi.mocked(riskNotifier);
const issueDueNotifierMock = vi.mocked(issueDueNotifier);
const controlNotifierMock = vi.mocked(controlNotifier);

describe('Notifier', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });
    it('should handle events that dont exist without crashing', async () => {
      await handler(
        stub<EventBridgeEvent<string, DataChangeEvent<Risk, 'risk'>>>({
          'detail-type': 'unknown',
          detail: {},
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(riskNotifierMock).not.toHaveBeenCalled();
    });
    it('should handle risk data change events', async () => {
      await handler(
        stub<EventBridgeEvent<string, DataChangeEvent<Risk, 'risk'>>>({
          'detail-type': 'DataChanged',
          detail: {
            table: { name: 'risk' },
            event: {
              op: 'UPDATE',
              data: {
                old: {
                  Id: '1',
                  OrgKey: 'org-id',
                },
                new: {
                  Id: '1',
                  OrgKey: 'org-id',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(riskNotifierMock).toHaveBeenCalled();
      expect(controlNotifierMock).not.toHaveBeenCalled();
    });
    it('should handle risk_assessment_result data change events', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<RiskAssessmentResult, 'risk_assessment_result'>
          >
        >({
          'detail-type': 'DataChanged',
          detail: {
            table: { name: 'risk_assessment_result' },
            event: {
              op: 'UPDATE',
              data: {
                old: {
                  Id: '1',
                  OrgKey: 'org-id',
                },
                new: {
                  Id: '1',
                  OrgKey: 'org-id',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(riskNotifierMock).toHaveBeenCalled();
    });
    it('should handle multiple notifications from a single event - Indicator', async () => {
      await handler(
        stub<EventBridgeEvent<string, DataChangeEvent<Indicator, 'indicator'>>>(
          {
            'detail-type': 'DataChanged',
            detail: {
              table: { name: 'indicator' },
              event: {
                op: 'UPDATE',
                data: {
                  old: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                  new: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                },
              },
            },
          }
        ),
        stub<Context>({}),
        vi.fn()
      );

      expect(riskNotifierMock).toHaveBeenCalled();
      expect(controlNotifierMock).toHaveBeenCalled();
    });
    it('should handle non data change - IssueDue - events', async () => {
      await handler(
        stub<EventBridgeEvent<string, { meta: { tenant: string } }>>({
          'detail-type': 'IssueDue',
          detail: {},
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(issueDueNotifierMock).toHaveBeenCalled();
    });
    it('should throw an error if the function errors', async () => {
      riskNotifierMock.mockRejectedValue('Big Errors!');
      await expect(
        handler(
          stub<EventBridgeEvent<string, DataChangeEvent<Risk, 'risk'>>>({
            'detail-type': 'DataChanged',
            detail: {
              table: { name: 'risk' },
              event: {
                op: 'UPDATE',
                data: {
                  old: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                  new: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                },
              },
            },
          }),
          stub<Context>({}),
          vi.fn()
        )
      ).rejects.toThrow(AggregateError(['Big Errors!']));

      expect(riskNotifierMock).toHaveBeenCalled();
      expect(controlNotifierMock).not.toHaveBeenCalled();
    });
    it('should continue and process all events if an error is thrown in one handler', async () => {
      riskNotifierMock.mockRejectedValue('Big Errors!');
      await expect(
        handler(
          stub<
            EventBridgeEvent<string, DataChangeEvent<Indicator, 'indicator'>>
          >({
            'detail-type': 'DataChanged',
            detail: {
              table: { name: 'indicator' },
              event: {
                op: 'UPDATE',
                data: {
                  old: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                  new: {
                    Id: '1',
                    OrgKey: 'org-id',
                  },
                },
              },
            },
          }),
          stub<Context>({}),
          vi.fn()
        )
      ).rejects.toThrow(AggregateError(['Big Errors!']));

      expect(riskNotifierMock).toHaveBeenCalled();
      expect(controlNotifierMock).toHaveBeenCalled();
    });
  });
});
