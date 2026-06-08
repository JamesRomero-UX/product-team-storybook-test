import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend users', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:users',
      source_service: 'external-api',
    });
    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${baseUrl}/trpc`,
          headers: () => createAuthHeaders(testExtApiJwt),
          transformer: superjson,
        }),
      ],
    });
  });

  it('should return a user item with a valid token for first test user', async () => {
    const expectedId = 'auth0|644151efc3a961d2784456d9';
    const itemResult = await trpcClient.backend.v1.user.userById.query({
      userId: expectedId,
    });

    expect(itemResult).toBeDefined();
    expect(itemResult?.user).toBeDefined();
    expect(itemResult?.user.Id).toStrictEqual(expectedId);
    expect(itemResult?.user.FirstName).toBeDefined();
    expect(itemResult?.user.LastName).toBeDefined();
    expect(itemResult?.user.FriendlyName).toBeDefined();
    expect(itemResult?.user.Email).toBeDefined();
    expect(itemResult?.form_configuration).toBeNull();
  });

  it('should return a user item with a valid token for second test user', async () => {
    const expectedId = 'auth0|644152102c766a09dd585d2e';
    const itemResult = await trpcClient.backend.v1.user.userById.query({
      userId: expectedId,
    });

    expect(itemResult).toBeDefined();
    expect(itemResult?.user).toBeDefined();
    expect(itemResult?.user.Id).toStrictEqual(expectedId);
    expect(itemResult?.form_configuration).toBeNull();
  });

  it('should return null for non-existent user', async () => {
    const nonExistentId = 'blahblah123';
    const itemResult = await trpcClient.backend.v1.user.userById.query({
      userId: nonExistentId,
    });

    expect(itemResult).toBeNull();
  });

  it('should return a list of users with no args', async () => {
    const result = await trpcClient.backend.v1.user.userList.query();

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.length).toBeGreaterThan(0);

    const firstUser = result.user[0];
    expect(firstUser?.Id).toBeDefined();
    expect(firstUser?.FirstName).toBeDefined();
    expect(firstUser?.LastName).toBeDefined();
    expect(firstUser?.Email).toBeDefined();
  });

  it('should enforce limit on user list', async () => {
    const result = await trpcClient.backend.v1.user.userList.query({
      limit: 2,
    });

    expect(result.user.length).toBeLessThanOrEqual(2);
  });

  it('should return correct page metadata structure', async () => {
    const result = await trpcClient.backend.v1.user.userList.query({
      limit: 2,
    });

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(result.pageMetadata.count).toBe(result.user.length);
  });

  it('should filter by a single user Id', async () => {
    const targetId = 'auth0|644151efc3a961d2784456d9';
    const result = await trpcClient.backend.v1.user.userList.query({
      filter: { Id: [targetId] },
    });

    expect(result.user).toHaveLength(1);
    expect(result.user[0]?.Id).toBe(targetId);
  });

  it('should filter by multiple user Ids', async () => {
    const ids = [
      'auth0|644151efc3a961d2784456d9',
      'auth0|6580670a706adf1843972000',
    ];
    const result = await trpcClient.backend.v1.user.userList.query({
      filter: { Id: ids },
    });

    expect(result.user).toHaveLength(2);
    const returnedIds = result.user.map((u) => u.Id);
    expect(returnedIds).toContain(ids[0]);
    expect(returnedIds).toContain(ids[1]);
  });

  it('should return empty list when filtering by non-existent Id', async () => {
    const result = await trpcClient.backend.v1.user.userList.query({
      filter: { Id: ['non-existent-id'] },
    });

    expect(result.user).toHaveLength(0);
  });

  it('should return users in descending order by LastSeen', async () => {
    const result = await trpcClient.backend.v1.user.userList.query({
      limit: 10,
    });

    const timestamps = result.user
      .map((u) => u.LastSeen)
      .filter((ts): ts is NonNullable<typeof ts> => ts != null);

    for (let i = 1; i < timestamps.length; i++) {
      expect(new Date(timestamps[i - 1]!).getTime()).toBeGreaterThanOrEqual(
        new Date(timestamps[i]!).getTime()
      );
    }
  });
});
