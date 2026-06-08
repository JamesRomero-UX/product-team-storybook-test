import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend indicators', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:indicators',
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

  it('should return a list of indicator results by indicator id with a valid token', async () => {
    const indicatorId = '032f6146-8dd7-4f07-b8fd-06156eeaed62';
    const results =
      await trpcClient.backend.v1.indicator.indicatorResultList.query({
        linkId: indicatorId ?? '',
      });
    const resultItemId = results.indicatorResult[0]?.Id;
    const result =
      await trpcClient.backend.v1.indicator.indicatorResultById.query({
        indicatorResultId: resultItemId ?? '',
      });

    expect(results).toBeDefined();
    expect(results.indicatorResult).toBeDefined();
    expect(results.indicatorResult.length).toBeGreaterThan(0);
    expect(result?.indicatorResult.Id).toBeTruthy();
  });

  it('should return a list of indicators with using valid token', async () => {
    const result = await trpcClient.backend.v1.indicator.indicatorList.query();

    expect(result).toBeDefined();
    expect(result.indicator).toBeDefined();
    expect(result.indicator.length).toBeGreaterThan(0);
    expect(result.indicator[0]?.SequentialId).toBeTruthy();
  });

  it('should return a indicator item with a valid token', async () => {
    const listResult =
      await trpcClient.backend.v1.indicator.indicatorList.query();

    expect(listResult.indicator.length).toBeGreaterThan(0);

    const expectedId = listResult.indicator[0]!.Id;
    const itemResult =
      await trpcClient.backend.v1.indicator.indicatorById.query({
        indicatorId: expectedId,
      });

    expect(itemResult?.indicator.Id).toStrictEqual(expectedId);
  });

  it('should return a list of indicators with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.indicator.indicatorList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.indicator).toBeDefined();
    expect(result.indicator.length).toBe(expectedLimit);
  });

  it('should return a list of indicators since an id value', async () => {
    const all = await trpcClient.backend.v1.indicator.indicatorList.query();
    const cursor = all.indicator[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.indicator.indicatorList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.indicator).toBeDefined();
    expect(result.indicator[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of indicators before an id value', async () => {
    const all = await trpcClient.backend.v1.indicator.indicatorList.query();
    const cursor = all.indicator.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.indicator.indicatorList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.indicator).toBeDefined();
    expect(result.indicator[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.indicator.indicatorList.query({
      limit: 2,
    });
    // Go forward
    const page2 = await trpcClient.backend.v1.indicator.indicatorList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.indicator.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.indicator.indicatorList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.indicator.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.indicator)).toStrictEqual(ids(page1.indicator));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.indicator.indicatorList.query({
      limit: 1000,
    });
    const maxId = many.indicator.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.indicator.indicatorList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.indicator).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
