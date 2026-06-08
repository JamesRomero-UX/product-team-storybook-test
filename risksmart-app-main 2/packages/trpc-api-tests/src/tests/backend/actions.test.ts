import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend actions', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:actions',
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

  it('should return a list of actions with using valid token', async () => {
    const result = await trpcClient.backend.v1.action.actionList.query();

    expect(result).toBeDefined();
    expect(result.action).toBeDefined();
    expect(result.action.length).toBeGreaterThan(0);
    expect(result.action[0]?.SequentialId).toBeTruthy();
  });

  it('should return a action item with a valid token', async () => {
    const listResult = await trpcClient.backend.v1.action.actionList.query();
    const expectedId = listResult.action[0]?.Id || '';
    const itemResult = await trpcClient.backend.v1.action.actionById.query({
      actionId: expectedId,
    });

    expect(itemResult?.action.Id).toStrictEqual(expectedId);
  });

  it('should return a list of actions with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.action.actionList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.action).toBeDefined();
    expect(result.action.length).toBe(expectedLimit);
  });

  it('should return a list of actions since an id value', async () => {
    const all = await trpcClient.backend.v1.action.actionList.query();
    const cursor = all.action[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.action.actionList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.action).toBeDefined();
    expect(result.action[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of actions before an id value', async () => {
    const all = await trpcClient.backend.v1.action.actionList.query();
    const cursor = all.action.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.action.actionList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.action).toBeDefined();
    expect(result.action[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.action.actionList.query({
      limit: 2,
    });
    // Go forward
    const page2 = await trpcClient.backend.v1.action.actionList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.action.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.action.actionList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.action.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.action)).toStrictEqual(ids(page1.action));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.action.actionList.query({
      limit: 1000,
    });
    const maxId = many.action.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.action.actionList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.action).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
