import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend documents', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:documents',
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

  it('should return a list of documents with using valid token', async () => {
    const result = await trpcClient.backend.v1.document.documentList.query();

    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document.length).toBeGreaterThan(0);
    expect(result.document[0]?.SequentialId).toBeTruthy();
  });

  it('should return a document item with a valid token', async () => {
    const listResult =
      await trpcClient.backend.v1.document.documentList.query();
    const expectedId = listResult.document[0]?.Id || '';
    const itemResult = await trpcClient.backend.v1.document.documentById.query({
      documentId: expectedId,
    });

    expect(itemResult?.document.Id).toStrictEqual(expectedId);
  });

  it('should return a list of documents with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.document.documentList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document.length).toBe(expectedLimit);
  });

  it('should return a list of documents since an id value', async () => {
    const all = await trpcClient.backend.v1.document.documentList.query();
    const cursor = all.document[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.document.documentList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of documents before an id value', async () => {
    const all = await trpcClient.backend.v1.document.documentList.query();
    const cursor = all.document.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.document.documentList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.document.documentList.query({
      limit: 2,
    });
    // Go forward
    const page2 = await trpcClient.backend.v1.document.documentList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.document.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.document.documentList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.document.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.document)).toStrictEqual(ids(page1.document));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.document.documentList.query({
      limit: 1000,
    });
    const maxId = many.document.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.document.documentList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.document).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
