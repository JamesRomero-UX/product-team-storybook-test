import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend controls', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:controls',
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

  it('should return a list of controls with using valid token', async () => {
    const result = await trpcClient.backend.v1.control.controlList.query();

    expect(result).toBeDefined();
    expect(result.control).toBeDefined();
    expect(result.control.length).toBeGreaterThan(0);
    expect(result.control[0]?.Id).toBeTruthy();
  });

  it('should return a control item with a valid token', async () => {
    const listResult = await trpcClient.backend.v1.control.controlList.query();
    const expectedControlId = listResult.control[0]?.Id || '';
    const itemResult = await trpcClient.backend.v1.control.controlById.query({
      controlId: expectedControlId,
    });

    expect(itemResult?.control.Id).toStrictEqual(expectedControlId);
  });

  it('should return a list of controls with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.control.controlList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.control).toBeDefined();
    expect(result.control.length).toBe(expectedLimit);
  });

  it('should return a list of controls since an id value', async () => {
    const all = await trpcClient.backend.v1.control.controlList.query();
    const cursor = all.control[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.control.controlList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.control).toBeDefined();
    expect(result.control[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of controls before an id value', async () => {
    const all = await trpcClient.backend.v1.control.controlList.query();
    const cursor = all.control.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.control.controlList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.control).toBeDefined();
    expect(result.control[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.control.controlList.query({
      limit: 2,
    });
    // Go forward
    const page2 = await trpcClient.backend.v1.control.controlList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.control.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.control.controlList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.control.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.control)).toStrictEqual(ids(page1.control));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.control.controlList.query({
      limit: 1000,
    });
    const maxId = many.control.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.control.controlList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.control).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
