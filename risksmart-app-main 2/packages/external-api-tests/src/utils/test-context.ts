import {
  buildOrganisation,
  buildOrganisationUser,
  buildUser,
  insertOrganisation,
  insertOrganisationUser,
  insertUser,
} from '@risksmart-app/test-data';
import { randomBytes, randomUUID } from 'crypto';

import { createHttpClient, type HttpClient } from './http-client';
import { generateTestToken } from './test-auth';

export interface TestContext {
  orgKey: string;
  userId: string;
  httpClient: HttpClient;
  token: string;
}

export const createTestContext = async (
  permissions: string = 'risks:read'
): Promise<TestContext> => {
  const orgKey = `org_${randomBytes(12).toString('base64')}`;
  const userId = randomUUID();

  const token = await generateTestToken({
    org_id: orgKey,
    user_id: userId,
    permissions,
    source_service: 'external-api',
  });

  const httpClient = createHttpClient({ token });

  await insertOrganisation(buildOrganisation(orgKey));
  const insertedUser = await insertUser(buildUser(userId));

  if (!insertedUser) {
    throw new Error('Failed to insert user for test context');
  }
  // Create organisation user to populate user_view_active view
  const organisationUser = buildOrganisationUser({
    orgKey,
    userId: insertedUser.Id,
  });
  await insertOrganisationUser(organisationUser);

  return { orgKey, userId, httpClient, token };
};

/**
 * Short delay to allow data inserted directly into the database
 * to become visible to the API server's connection pool.
 */
export const waitForDbPropagation = (ms = 0) =>
  ms === 0
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, ms));
