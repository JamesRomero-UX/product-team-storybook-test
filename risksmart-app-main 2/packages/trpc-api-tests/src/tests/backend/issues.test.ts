import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

describe('Backend issues', () => {
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

  it('should return a list of issues with using valid token', async () => {
    const result = await trpcClient.backend.v1.issue.issueList.query();

    expect(result).toBeDefined();
    expect(result.issue).toBeDefined();
    expect(result.issue.length).toBeGreaterThan(0);
    expect(result.issue[0]?.SequentialId).toBeTruthy();
  });

  it('should return an item with a valid token', async () => {
    const listResult = await trpcClient.backend.v1.issue.issueList.query();
    const expectedId = listResult.issue[0]?.Id || '';
    const itemResult = await trpcClient.backend.v1.issue.issueById.query({
      issueId: expectedId,
    });

    expect(itemResult?.issue.Id).toStrictEqual(expectedId);
  });

  it('should return a list of items with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.issue.issueList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.issue).toBeDefined();
    expect(result.issue.length).toBe(expectedLimit);
  });

  it('should return a list of items since an id value', async () => {
    const all = await trpcClient.backend.v1.issue.issueList.query();
    const cursor = all.issue[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.issue.issueList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.issue).toBeDefined();
    expect(result.issue[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of items before an id value', async () => {
    const all = await trpcClient.backend.v1.issue.issueList.query();
    const cursor = all.issue.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.issue.issueList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.issue).toBeDefined();
    expect(result.issue[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.issue.issueList.query({
      limit: 2,
    });
    // Go forward
    const page2 = await trpcClient.backend.v1.issue.issueList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.issue.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.issue.issueList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.issue.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.issue)).toStrictEqual(ids(page1.issue));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.issue.issueList.query({
      limit: 1000,
    });
    const maxId = many.issue.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.issue.issueList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.issue).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });

  describe('Issue nested endpoints', () => {
    const testIssueId = '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90';

    it('should return a list of consequences for an issue', async () => {
      const result =
        await trpcClient.backend.v1.issue.issueConsequencesList.query({
          linkId: testIssueId,
        });

      expect(result).toBeDefined();
      expect(result.consequence).toBeDefined();
      expect(result.consequence.length).toBeGreaterThan(0);
      expect(result.pageMetadata).toBeDefined();
    });

    it('should return a consequence by id', async () => {
      const listResult =
        await trpcClient.backend.v1.issue.issueConsequencesList.query({
          linkId: testIssueId,
        });
      const expectedId = listResult.consequence[0]?.Id || '';
      const itemResult =
        await trpcClient.backend.v1.issue.issueConsequenceById.query({
          id: expectedId,
        });

      expect(itemResult?.consequence.Id).toStrictEqual(expectedId);
    });

    it('should return a list of causes for an issue', async () => {
      const result = await trpcClient.backend.v1.issue.issueCausesList.query({
        linkId: testIssueId,
      });

      expect(result).toBeDefined();
      expect(result.cause).toBeDefined();
      expect(result.cause.length).toBeGreaterThan(0);
      expect(result.pageMetadata).toBeDefined();
    });

    it('should return a cause by id', async () => {
      const listResult =
        await trpcClient.backend.v1.issue.issueCausesList.query({
          linkId: testIssueId,
        });
      const expectedId = listResult.cause[0]?.Id || '';
      const itemResult = await trpcClient.backend.v1.issue.issueCauseById.query(
        {
          id: expectedId,
        }
      );

      expect(itemResult?.cause.Id).toStrictEqual(expectedId);
    });

    it('should return a list of updates for an issue', async () => {
      const result = await trpcClient.backend.v1.issue.issueUpdatesList.query({
        linkId: testIssueId,
      });

      expect(result).toBeDefined();
      expect(result.update).toBeDefined();
      expect(result.update.length).toBeGreaterThan(0);
      expect(result.pageMetadata).toBeDefined();
    });

    it('should return an issue assessment', async () => {
      const result = await trpcClient.backend.v1.issue.issueAssessment.query({
        id: testIssueId,
      });
      const expectedId = result?.issueAssessment.Id;
      const expectedParentId = result?.issueAssessment.ParentIssueId;

      expect(expectedParentId).toStrictEqual(testIssueId);
      expect(expectedId).toBeDefined();
    });
  });
});
