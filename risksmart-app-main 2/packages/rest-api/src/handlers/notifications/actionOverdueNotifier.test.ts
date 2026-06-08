import type { Context, EventBridgeEvent } from 'aws-lambda';
import {
  getOrgDetails,
  getOrgFeatures,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { handler } from './actionOverdueNotifier';
import type { ActionOverdueEventDetail } from './actionOverduePoller';
import { getActionParentIds } from './actionUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { RisksmartDetailType } from './eventBridgeUtils';
import {
  getAncestorContributors,
  getDirectParentContributors,
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectOwnerGroups,
  getObjectOwners,
  getRecipientObjects,
} from './recipientUtilities';
import { triggerNotification } from './utilities';

vi.mock('src/services/orgUtilities');
vi.mock('./checkIdempotency');
vi.mock('./utilities', async () => {
  const actual = await vi.importActual('./utilities');

  return {
    ...actual,
    triggerNotification: vi.fn(),
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
    getAncestorContributors: vi.fn(),
    getDirectParentContributors: vi.fn(),
    getObjectContributors: vi.fn(),
    getObjectContributorsGroups: vi.fn(),
    getObjectDepartments: vi.fn(),
    getObjectOwnerGroups: vi.fn(),
    getObjectOwners: vi.fn(),
    getRecipientObjects: vi.fn(),
  };
});
vi.mock('sst/node/table', () => ({
  Table: {
    'test-tenant_IdempotencyNotificationCheck': {
      tableName: 'test-idempotency-table',
    },
  },
}));

const isNotificationsEnabledMock = vi.mocked(isNotificationsEnabled);
const getOrgFeaturesMock = vi.mocked(getOrgFeatures);
const getOrgDetailsMock = vi.mocked(getOrgDetails);
const checkIdempotencyKeyExistsMock = vi.mocked(checkIdempotencyKeyExists);
const setIdempotencyMock = vi.mocked(setIdempotency);
const getActionParentIdsMock = vi.mocked(getActionParentIds);
const getDirectParentContributorsMock = vi.mocked(getDirectParentContributors);
const getAncestorContributorsMock = vi.mocked(getAncestorContributors);
const getRecipientObjectsMock = vi.mocked(getRecipientObjects);
const getObjectOwnersMock = vi.mocked(getObjectOwners);
const getObjectOwnerGroupsMock = vi.mocked(getObjectOwnerGroups);
const getObjectContributorsMock = vi.mocked(getObjectContributors);
const getObjectContributorsGroupsMock = vi.mocked(getObjectContributorsGroups);
const getObjectDepartmentsMock = vi.mocked(getObjectDepartments);
const triggerNotificationMock = vi.mocked(triggerNotification);

describe('actionOverdueNotifier', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws an error when an error is thrown within the handler (i.e. errors are not discarded)', async () => {
    await expect(
      handler(
        stub<Parameters<typeof handler>[0]>({}),
        stub<Context>({}),
        vi.fn()
      )
    ).rejects.toThrow();
  });

  describe('no_inherit feature flag', () => {
    const createActionOverdueEvent = () =>
      stub<
        EventBridgeEvent<
          RisksmartDetailType.ActionOverdue,
          ActionOverdueEventDetail
        >
      >({
        'detail-type': RisksmartDetailType.ActionOverdue,
        detail: {
          meta: {
            tenant: 'test-tenant',
          },
          data: {
            Id: 'action-1',
            OrgKey: 'test-org',
            Title: 'Test Action',
            DateDue: '2024-01-15T00:00:00Z',
            SequentialId: 1,
          },
        },
      });

    const setupCommonMocks = () => {
      isNotificationsEnabledMock.mockResolvedValue(true);
      checkIdempotencyKeyExistsMock.mockResolvedValue(false);
      setIdempotencyMock.mockResolvedValue(true);
      getOrgDetailsMock.mockResolvedValue({
        OrgKey: 'test-org',
        OrgName: 'Test Org',
      });
      getRecipientObjectsMock.mockResolvedValue([]);
      getObjectOwnersMock.mockResolvedValue([]);
      getObjectOwnerGroupsMock.mockResolvedValue([]);
      getObjectContributorsMock.mockResolvedValue([]);
      getObjectContributorsGroupsMock.mockResolvedValue([]);
      getObjectDepartmentsMock.mockResolvedValue([]);
      triggerNotificationMock.mockResolvedValue({
        workflow_run_id: 'test-run-id',
      });
    };

    it('should use direct parent contributors when no_inherit feature flag is enabled', async () => {
      setupCommonMocks();
      getOrgFeaturesMock.mockResolvedValue(['notifications', 'no_inherit']);
      getActionParentIdsMock.mockResolvedValue(['parent-1']);
      getDirectParentContributorsMock.mockResolvedValue([
        { id: 'direct-user-1', name: 'Direct User', email: 'direct@test.com' },
      ]);

      await handler(createActionOverdueEvent(), stub<Context>({}), vi.fn());

      expect(getOrgFeaturesMock).toHaveBeenCalledWith({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });
      expect(getDirectParentContributorsMock).toHaveBeenCalled();
      expect(getAncestorContributorsMock).not.toHaveBeenCalled();
    });

    it('should use ancestor contributors when no_inherit feature flag is disabled', async () => {
      setupCommonMocks();
      getOrgFeaturesMock.mockResolvedValue(['notifications']);
      getAncestorContributorsMock.mockResolvedValue([
        {
          group: false,
          id: 'ancestor-user-1',
          name: 'Ancestor User',
          email: 'ancestor@test.com',
        },
      ]);

      await handler(createActionOverdueEvent(), stub<Context>({}), vi.fn());

      expect(getOrgFeaturesMock).toHaveBeenCalledWith({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });
      expect(getDirectParentContributorsMock).not.toHaveBeenCalled();
      expect(getAncestorContributorsMock).toHaveBeenCalled();
    });
  });
});
