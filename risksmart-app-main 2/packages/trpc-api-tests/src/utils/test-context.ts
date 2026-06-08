import {
  buildOrganisation,
  buildOrganisationUser,
  buildUser,
  deleteTestOrg,
  insertOrganisation,
  insertOrganisationUser,
  insertUser,
} from '@risksmart-app/test-data';
import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { randomUUID } from 'crypto';
import superjson from 'superjson';

import { createAuthHeaders, generateTestToken } from './test-auth';

const baseUrl = process.env.TRPC_TEST_URL;

// Test helper functions
export const createTestContext = async (
  claimOverrides?: Parameters<typeof generateTestToken>[0]
) => {
  const orgKey = randomUUID();
  const userId = randomUUID();
  const testUserJwt = await generateTestToken({
    org_id: orgKey,
    user_id: userId,
    scope: 'openid offline_access',
    ...claimOverrides,
  });

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        headers: () => createAuthHeaders(testUserJwt),
        transformer: superjson,
      }),
    ],
  });

  await insertOrganisation(buildOrganisation(orgKey));
  const insertedUser = await insertUser(buildUser(userId));

  // Create organisation user to populate user_view_active view
  const organisationUser = buildOrganisationUser({
    orgKey,
    userId: insertedUser!.Id,
  });
  await insertOrganisationUser(organisationUser);

  return {
    orgKey,
    userId,
    trpcClient,
    insertedUser,
    cleanup: () => deleteTestOrg(orgKey, userId),
  };
};
