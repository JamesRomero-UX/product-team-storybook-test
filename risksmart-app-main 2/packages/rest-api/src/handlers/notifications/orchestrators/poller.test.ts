import type { Context, EventBridgeEvent } from 'aws-lambda';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import {
  actionDuePoller,
  actionOverduePoller,
  issueDuePoller,
  issueOverduePoller,
  policyAttestationReminderPoller,
  policyDocumentVersionReviewDuePoller,
  policyDocumentVersionReviewUpcomingPoller,
  scheduleDuePoller,
  scheduleOverduePoller,
} from '../index';
import { handler } from './poller';

vi.mock('../index');
const actionDuePollerMock = vi.mocked(actionDuePoller);
const actionOverduePollerMock = vi.mocked(actionOverduePoller);
const issueDuePollerMock = vi.mocked(issueDuePoller);
const issueOverduePollerMock = vi.mocked(issueOverduePoller);
const policyAttestationReminderPollerMock = vi.mocked(
  policyAttestationReminderPoller
);
const policyDocumentVersionReviewDuePollerMock = vi.mocked(
  policyDocumentVersionReviewDuePoller
);
const policyDocumentVersionReviewUpcomingPollerMock = vi.mocked(
  policyDocumentVersionReviewUpcomingPoller
);
const scheduleDuePollerMock = vi.mocked(scheduleDuePoller);
const scheduleOverduePollerMock = vi.mocked(scheduleOverduePoller);

describe('Poller', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });
    it('should invoke all the pollers configured', async () => {
      await handler(
        stub<EventBridgeEvent<string, { tenant: string }>>({
          detail: { tenant: 'tenant1' },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(actionDuePollerMock).toHaveBeenCalled();
      expect(actionOverduePollerMock).toHaveBeenCalled();
      expect(issueDuePollerMock).toHaveBeenCalled();
      expect(issueOverduePollerMock).toHaveBeenCalled();
      expect(policyAttestationReminderPollerMock).toHaveBeenCalled();
      expect(policyDocumentVersionReviewDuePollerMock).toHaveBeenCalled();
      expect(policyDocumentVersionReviewUpcomingPollerMock).toHaveBeenCalled();
      expect(scheduleDuePollerMock).toHaveBeenCalled();
      expect(scheduleOverduePollerMock).toHaveBeenCalled();
    });

    it('should invoke all pollers if some fail', async () => {
      issueOverduePollerMock.mockRejectedValue('Biggest Errors!');
      policyDocumentVersionReviewUpcomingPollerMock.mockRejectedValue(
        'Big Errors!'
      );

      await expect(
        handler(
          stub<EventBridgeEvent<string, { tenant: string }>>({
            detail: { tenant: 'tenant1' },
          }),
          stub<Context>({}),
          vi.fn()
        )
      ).rejects.toThrow(AggregateError(['Biggest Errors!', 'Big Errors!']));

      expect(actionDuePollerMock).toHaveBeenCalled();
      expect(actionOverduePollerMock).toHaveBeenCalled();
      expect(issueDuePollerMock).toHaveBeenCalled();
      expect(issueOverduePollerMock).toHaveBeenCalled();
      expect(policyAttestationReminderPollerMock).toHaveBeenCalled();
      expect(policyDocumentVersionReviewDuePollerMock).toHaveBeenCalled();
      expect(policyDocumentVersionReviewUpcomingPollerMock).toHaveBeenCalled();
      expect(scheduleDuePollerMock).toHaveBeenCalled();
      expect(scheduleOverduePollerMock).toHaveBeenCalled();
    });
  });
});
