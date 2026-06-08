import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend user groups', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:user_groups',
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

  it('should return null for non-existent user group', async () => {
    const result = await trpcClient.backend.v1.userGroup.userGroupById.query({
      userGroupId: '00000000-0000-0000-0000-000000000000',
    });

    expect(result).toBeNull();
  });

  it('should return a list of user groups with no args', async () => {
    const result = await trpcClient.backend.v1.userGroup.userGroupList.query();

    expect(result).toBeDefined();
    expect(result.userGroup).toBeDefined();
    expect(result.userGroup.length).toBeGreaterThan(0);

    const firstGroup = result.userGroup[0];
    expect(firstGroup?.Id).toBeDefined();
    expect(firstGroup?.Name).toBeDefined();
  });

  it('should enforce limit on user group list', async () => {
    const result = await trpcClient.backend.v1.userGroup.userGroupList.query({
      limit: 2,
    });

    expect(result.userGroup.length).toBeLessThanOrEqual(2);
  });

  it('should return correct page metadata structure', async () => {
    const result = await trpcClient.backend.v1.userGroup.userGroupList.query({
      limit: 2,
    });

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(result.pageMetadata.count).toBe(result.userGroup.length);
  });

  it('should filter by user group Id and return a matching item by id', async () => {
    const listResult =
      await trpcClient.backend.v1.userGroup.userGroupList.query();
    expect(listResult.userGroup.length).toBeGreaterThan(0);

    const targetId = listResult.userGroup[0]!.Id;

    const filteredResult =
      await trpcClient.backend.v1.userGroup.userGroupList.query({
        filter: { Id: [targetId] },
      });

    expect(filteredResult.userGroup).toHaveLength(1);
    expect(filteredResult.userGroup[0]?.Id).toBe(targetId);

    const byIdResult =
      await trpcClient.backend.v1.userGroup.userGroupById.query({
        userGroupId: targetId,
      });

    expect(byIdResult).toBeDefined();
    expect(byIdResult?.userGroup.Id).toBe(targetId);
    expect(byIdResult?.form_configuration).toBeNull();
  });

  it('should return empty list when filtering by non-existent Id', async () => {
    const result = await trpcClient.backend.v1.userGroup.userGroupList.query({
      filter: { Id: ['00000000-0000-0000-0000-000000000000'] },
    });

    expect(result.userGroup).toHaveLength(0);
  });
});
