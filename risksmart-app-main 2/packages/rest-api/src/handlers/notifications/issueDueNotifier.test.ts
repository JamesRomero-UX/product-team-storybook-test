import type { Context, EventBridgeEvent } from 'aws-lambda';
import {
  getOrgDetails,
  getOrgFeatures,
  isNotificationsEnabled,
} from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { handler } from './issueDueNotifier';
import type { IssueDueEventDetail } from './issueDuePoller';
import { getIssueById, getIssueParentIds } from './issueUtilities';
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
vi.mock('./issueUtilities', async () => {
  const actual = await vi.importActual('./issueUtilities');

  return {
    ...actual,
    getIssueById: vi.fn(),
    getIssueParentIds: vi.fn(),
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
const getIssueByIdMock = vi.mocked(getIssueById);
const getIssueParentIdsMock = vi.mocked(getIssueParentIds);
const getDirectParentContributorsMock = vi.mocked(getDirectParentContributors);
const getAncestorContributorsMock = vi.mocked(getAncestorContributors);
const getRecipientObjectsMock = vi.mocked(getRecipientObjects);
const getObjectOwnersMock = vi.mocked(getObjectOwners);
const getObjectOwnerGroupsMock = vi.mocked(getObjectOwnerGroups);
const getObjectContributorsMock = vi.mocked(getObjectContributors);
const getObjectContributorsGroupsMock = vi.mocked(getObjectContributorsGroups);
const getObjectDepartmentsMock = vi.mocked(getObjectDepartments);
const triggerNotificationMock = vi.mocked(triggerNotification);

describe('issueDueNotifier', () => {
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
    const createIssueDueEvent = () =>
      stub<EventBridgeEvent<string, IssueDueEventDetail>>({
        'detail-type': 'IssueDue',
        detail: {
          meta: {
            tenant: 'test-tenant',
          },
          data: {
            ParentIssueId: 'issue-1',
            OrgKey: 'test-org',
            TargetCloseDate: '2024-01-15T00:00:00Z',
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
      getIssueByIdMock.mockResolvedValue({
        Id: 'issue-1',
        OrgKey: 'test-org',
        Title: 'Test Issue',
        SequentialId: 1,
        Type: 'issue',
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
      getIssueParentIdsMock.mockResolvedValue(['parent-1']);
      getDirectParentContributorsMock.mockResolvedValue([
        { id: 'direct-user-1', name: 'Direct User', email: 'direct@test.com' },
      ]);

      await handler(createIssueDueEvent(), stub<Context>({}), vi.fn());

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

      await handler(createIssueDueEvent(), stub<Context>({}), vi.fn());

      expect(getOrgFeaturesMock).toHaveBeenCalledWith({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });
      expect(getDirectParentContributorsMock).not.toHaveBeenCalled();
      expect(getAncestorContributorsMock).toHaveBeenCalled();
    });
  });
});
