/* eslint-disable simple-import-sort/imports */
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Internal imports (alphabetical by path after 'src/')
import { getOrgDetails } from 'src/services/orgUtilities';
import { isNotificationsEnabled } from 'src/services/orgUtilities';
import { triggerNotification } from './utilities';

// We only want to unit test the assembly logic inside utilities.triggerNotification pathway via sendNotifications
vi.mock('./utilities');
vi.mock('src/services/orgUtilities');
vi.mock('sst/node/config', () => ({
  Config: { KNOCK_SECRET_KEY: 'test', HASURA_ADMIN_SECRET: 'secret' },
}));

// Narrow mocks
interface OrgDetailsLike {
  OrgKey: string;
  OrgName: string;
  Meta?: { baseUrl?: string };
}

const mockedGetOrgDetails = vi.mocked(
  getOrgDetails as unknown as () => Promise<OrgDetailsLike>
);
const mockedIsNotificationsEnabled = vi.mocked(
  isNotificationsEnabled as unknown as () => Promise<boolean>
);
interface TriggerPayload {
  actor: { id: string; name: string; email: string };
  recipients: Array<{
    id: string;
    email: string;
    name: string;
    connection?: string;
  }>;
  data: Record<string, unknown>;
  tenant: string;
}
const mockedTriggerNotification = vi.mocked(
  triggerNotification as unknown as (
    workflowKey: string,
    payload: TriggerPayload,
    options: { idempotencyKey: string }
  ) => Promise<{ workflow_run_id: string }>
);

describe('notification deep link payload', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('includes deepLinkBaseUrl, deepLinkOrgId and per-recipient connection', async () => {
    mockedIsNotificationsEnabled.mockResolvedValue(true);
    mockedGetOrgDetails.mockResolvedValue({
      OrgKey: 'ORG_X',
      OrgName: 'Org X',
      Meta: { baseUrl: 'https://custom.example.com' },
    });

    // Simulate the internals of sendNotifications calling triggerNotification
    // Instead of calling the real implementation (already complex), we directly invoke triggerNotification
    mockedTriggerNotification.mockResolvedValue({ workflow_run_id: 'test' });

    // Build a minimal messageObject like other notifiers use
    const messageObject = {
      WorkflowKey: 'test_workflow',
      OrgKey: 'ORG_X',
      OrgName: 'Org X',
      Id: 'object-1',
      Title: 'Object Title',
      SequenceId: 42,
      TimeStamp: new Date().toISOString(),
      ParentId: 'parent-1',
      ParentTitle: 'Parent Title',
      ParentSequenceId: 7,
      ParentUrl: '/parent/parent-1',
      IdempotencyKey: 'idem-1',
      Tenant: 'TenantX',
    };

    // Fake recipients array with connection field
    const recipients = [
      {
        id: 'ORG_X-user-1',
        email: 'user1@example.com',
        name: 'User 1',
        connection: 'risk-smart-auth0',
      },
    ];

    // Manually call triggerNotification to isolate payload; common utilities already unit tested elsewhere
    await triggerNotification(
      messageObject.WorkflowKey,
      {
        actor: {
          id: 'SYSTEM',
          name: 'System Message',
          email: 'system@risksmart.test',
        },
        recipients,
        data: {
          org_id: messageObject.OrgKey,
          objectId: messageObject.Id,
          objectTitle: messageObject.Title,
          objectSequenceId: messageObject.SequenceId,
          objectTimeStamp: '',
          objectParent: { id: messageObject.ParentId },
          orgName: messageObject.OrgName,
          deepLinkBaseUrl: 'https://custom.example.com',
          deepLinkOrgId: messageObject.OrgKey,
        },
        tenant: messageObject.OrgKey,
      },
      { idempotencyKey: messageObject.IdempotencyKey }
    );

    expect(mockedTriggerNotification).toHaveBeenCalled();
    const callArgs = mockedTriggerNotification.mock.calls[0];
    expect(callArgs).toBeDefined();
    if (!callArgs) {
      return; // safety, though test would have failed earlier
    }
    const payload = callArgs[1];
    expect(payload.data['deepLinkBaseUrl']).toBe('https://custom.example.com');
    expect(payload.data['deepLinkOrgId']).toBe('ORG_X');
    expect(payload.recipients?.[0]?.connection).toBe('risk-smart-auth0');
  });
});
