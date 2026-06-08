import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend enterprise risks', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:enterprise_risks',
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

  it('should return a enterprise risk, risks list with a valid token', async () => {
    const listResult =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query();
    const eRiskId = listResult.enterpriseRisk[0]?.Id || '';
    const itemResult =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskChildRiskList.query(
        {
          linkId: eRiskId,
        }
      );
    expect(itemResult?.risk).toBeDefined();
    expect(itemResult?.pageMetadata).toBeDefined();
  });

  it('should return a list of enterprise risks with using valid token', async () => {
    const result =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query();

    expect(result).toBeDefined();
    expect(result.enterpriseRisk).toBeDefined();
    expect(result.enterpriseRisk.length).toBeGreaterThan(0);
    expect(result.enterpriseRisk[0]?.SequentialId).toBeTruthy();
  });

  it('should return a enterprise risk item with a valid token', async () => {
    const listResult =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query();
    const expectedId = listResult.enterpriseRisk[0]?.Id || '';
    const itemResult =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskById.query({
        enterpriseRiskId: expectedId,
      });

    expect(itemResult?.enterpriseRisk.Id).toStrictEqual(expectedId);
  });

  it('should return a list of enterprise risks with a limit enforced', async () => {
    const expectedLimit = 3;
    const result =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        limit: expectedLimit,
      });

    expect(result).toBeDefined();
    expect(result.enterpriseRisk).toBeDefined();
    expect(result.enterpriseRisk.length).toBe(expectedLimit);
  });

  it('should return a list of enterprise risks since an id value', async () => {
    const all =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query();
    const cursor = all.enterpriseRisk[0]!.SequentialId;
    const result =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        afterSequentialId: cursor,
      });

    expect(result).toBeDefined();
    expect(result.enterpriseRisk).toBeDefined();
    expect(result.enterpriseRisk[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of enterprise risks before an id value', async () => {
    const all =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query();
    const cursor = all.enterpriseRisk.at(-1)!.SequentialId;
    const result =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        beforeSequentialId: cursor,
        limit: 1,
      });

    expect(result).toBeDefined();
    expect(result.enterpriseRisk).toBeDefined();
    expect(result.enterpriseRisk[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        limit: 2,
      });
    // Go forward
    const page2 =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        limit: 2,
        afterSequentialId:
          ((page1.pageMetadata.nextId ??
            page1.enterpriseRisk.at(-1)?.SequentialId) as number) ?? 0,
      });
    // Go back using beforeId
    const backTo1 =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        limit: 2,
        beforeSequentialId:
          ((page2.pageMetadata.prevId ??
            page2.enterpriseRisk.at(0)?.SequentialId) as number) ?? 0,
      });

    expect(ids(backTo1.enterpriseRisk)).toStrictEqual(
      ids(page1.enterpriseRisk)
    );
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        limit: 1000,
      });
    const maxId = many.enterpriseRisk.at(-1)?.SequentialId ?? 0;

    const res =
      await trpcClient.backend.v1.enterpriseRisk.enterpriseRiskList.query({
        afterSequentialId: maxId,
        limit: 5,
      });

    expect(res.enterpriseRisk).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
