import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { Action } from 'generated/graphql';
import {
  getOrgFeatures,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handler } from './actionNotifier';
import { getActionParentIds } from './actionUtilities';
import { getDirectParentContributors } from './recipientUtilities';
import { sendNotifications } from './utilities';

vi.mock('src/services/orgUtilities');
vi.mock('./utilities', async () => {
  const actual = await vi.importActual('./utilities');

  return {
    ...actual,
    sendNotifications: vi.fn(),
  };
});
vi.mock('./actionUtilities', async () => {
  const actual = await vi.importActual('./actionUtilities');

  return {
    ...actual,
    getActionParentIds: vi.fn(),
  };
});
vi.mock('./recipientUtilities', async () => {
  const actual = await vi.importActual('./recipientUtilities');

  return {
    ...actual,
    getDirectParentContributors: vi.fn(),
  };
});

const sendNotificationsMock = vi.mocked(sendNotifications);
const isNotificationsEnabledMock = vi.mocked(isNotificationsEnabled);
const getOrgFeaturesMock = vi.mocked(getOrgFeatures);
const getActionParentIdsMock = vi.mocked(getActionParentIds);
const getDirectParentContributorsMock = vi.mocked(getDirectParentContributors);

describe('actionNotifier', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws an error when an error is thrown within the handler (i.e. errors are not discarded)', async () => {
    await expect(
      handler(
        // loads of missing data on event to generate an error!
        stub<Parameters<typeof handler>[0]>({}),
        stub<Context>({}),
        vi.fn()
      )
    ).rejects.toThrow();
  });

  describe('no_inherit feature flag', () => {
    const createActionEvent = () =>
      stub<EventBridgeEvent<string, DataChangeEvent<Action, 'action'>>>({
        'detail-type': 'DataChanged',
        detail: {
          event: {
            op: 'INSERT',
            session_variables: {
              'x-hasura-tenant-name': 'test-tenant',
              'x-hasura-org-id': 'test-org',
              'x-hasura-user-id': 'test-user',
            },
            data: {
              new: {
                Id: 'action-1',
                OrgKey: 'test-org',
                Title: 'Test Action',
                CreatedAtTimestamp: '2024-01-01T00:00:00Z',
                CreatedByUser: 'test-user',
                SequentialId: 1,
              },
            },
          },
          table: { name: 'action' },
        },
      });

    it('should set excludeAncestorContributors to true when no_inherit feature flag is enabled', async () => {
      isNotificationsEnabledMock.mockResolvedValue(true);
      getOrgFeaturesMock.mockResolvedValue(['notifications', 'no_inherit']);
      getActionParentIdsMock.mockResolvedValue(['parent-1']);
      getDirectParentContributorsMock.mockResolvedValue([
        { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
      ]);

      await handler(createActionEvent(), stub<Context>({}), vi.fn());

      expect(getOrgFeaturesMock).toHaveBeenCalledWith({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });
      expect(getDirectParentContributorsMock).toHaveBeenCalled();
      expect(sendNotificationsMock).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          excludeAncestorContributors: true,
          extraRecipients: [
            { id: 'user-1', name: 'User 1', email: 'user1@test.com' },
          ],
        })
      );
    });

    it('should not set excludeAncestorContributors when no_inherit feature flag is disabled', async () => {
      isNotificationsEnabledMock.mockResolvedValue(true);
      getOrgFeaturesMock.mockResolvedValue(['notifications']);

      await handler(createActionEvent(), stub<Context>({}), vi.fn());

      expect(getOrgFeaturesMock).toHaveBeenCalledWith({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });
      expect(getDirectParentContributorsMock).not.toHaveBeenCalled();
      expect(sendNotificationsMock).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({})
      );
      // Verify excludeAncestorContributors is not true
      const callArgs = sendNotificationsMock.mock.calls[0];
      expect(callArgs?.[1]?.excludeAncestorContributors).toBeFalsy();
    });
  });
});
