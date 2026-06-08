import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { test } from 'vitest';

const adminApiClient = getBackendRestApiClient({
  tenant: 'MultiTenant',
  orgKey: '',
  userId: 'SYSTEM',
  userRole: 'admin',
});

/**
 * Extended test context for integration tests with useful context for items such as org and user
 */
export const intTest = test.extend<{
  org1: string;
  riskManager1: string;
  adminApiClient: typeof adminApiClient;
}>({
  adminApiClient,
  /**
   * Creates a new organisation and returns its id
   */
  org1: async ({ adminApiClient }, use) => {
    const orgKey = crypto.randomUUID();

    await adminApiClient.insertOrganisation({
      objects: {
        AuthTenant: '123',
        CreatedAtTimestamp: undefined,
        CreatedByUser: undefined,
        Meta: undefined,
        ModifiedAtTimestamp: undefined,
        ModifiedByUser: undefined,
        Name: 'Org 1',
        OrgKey: orgKey,
        ScimEnabled: undefined,
        organisationusers: undefined,
      },
    });
    await use(orgKey);
  },
  riskManager1: async ({ org1, adminApiClient }, use) => {
    const userId = crypto.randomUUID();
    await adminApiClient.insertUser({
      UserId: userId,
      Email: `${userId}@risksmart.com`,
      OrgKey: org1,
      CreatedByUser: 'SYSTEM',
      // TODO: insert role
    });
    await use(userId);
  },
});
