import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend linked items', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  const testLinkId = '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90';

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:linked_items',
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

  it('should return a list of linked items using valid token', async () => {
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
    });

    expect(result).toBeDefined();
    expect(result.linkedItem).toBeDefined();
    expect(Array.isArray(result.linkedItem)).toBe(true);
  });

  it('should return linked items with valid Id and timestamps', async () => {
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
    });

    expect(result).toBeDefined();
    expect(result.linkedItem).toBeDefined();

    if (result.linkedItem.length > 0) {
      const firstItem = result.linkedItem[0];
      expect(firstItem?.Id).toBeTruthy();
      expect(firstItem?.Source).toBe(testLinkId);
      expect(firstItem?.CreatedAtTimestamp).toBeTruthy();
    }
  });

  it('should return a list of linked items with a limit enforced', async () => {
    const expectedLimit = 2;
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.linkedItem).toBeDefined();
    expect(result.linkedItem.length).toBeLessThanOrEqual(expectedLimit);
  });

  it('should return page metadata with correct structure', async () => {
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: 3,
    });

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(typeof result.pageMetadata.count).toBe('number');
    expect(result.pageMetadata.count).toBe(result.linkedItem.length);

    if (result.pageMetadata.hasNext) {
      expect(result.pageMetadata.nextId).toBeTruthy();
      expect(result.pageMetadata.nextDateTime).toBeTruthy();
    } else {
      expect(result.pageMetadata.nextId).toBeNull();
      expect(result.pageMetadata.nextDateTime).toBeNull();
    }

    if (result.pageMetadata.hasPrev) {
      expect(result.pageMetadata.prevId).toBeTruthy();
      expect(result.pageMetadata.prevDateTime).toBeTruthy();
    } else {
      expect(result.pageMetadata.prevId).toBeNull();
      expect(result.pageMetadata.prevDateTime).toBeNull();
    }
  });

  it('should paginate forward using afterId and afterDateTime', async () => {
    const firstPage =
      await trpcClient.backend.v1.linkedItem.linkedItemList.query({
        linkId: testLinkId,
        limit: 2,
      });

    if (
      firstPage.pageMetadata.hasNext &&
      firstPage.pageMetadata.nextId &&
      firstPage.pageMetadata.nextDateTime
    ) {
      const secondPage =
        await trpcClient.backend.v1.linkedItem.linkedItemList.query({
          linkId: testLinkId,
          limit: 2,
          afterId: firstPage.pageMetadata.nextId,
          afterDateTime: firstPage.pageMetadata.nextDateTime,
        });

      expect(secondPage).toBeDefined();
      expect(secondPage.linkedItem).toBeDefined();

      // Verify no overlap between pages
      const firstPageIds = firstPage.linkedItem.map((item) => item.Id);
      const secondPageIds = secondPage.linkedItem.map((item) => item.Id);
      const intersection = firstPageIds.filter((id) =>
        secondPageIds.includes(id)
      );
      expect(intersection.length).toBe(0);
    }
  });

  it('should paginate backward using beforeId and beforeDateTime', async () => {
    const firstPage =
      await trpcClient.backend.v1.linkedItem.linkedItemList.query({
        linkId: testLinkId,
        limit: 5,
      });

    if (firstPage.linkedItem.length > 3) {
      const lastItem = firstPage.linkedItem.at(-1);
      if (lastItem) {
        const backwardPage =
          await trpcClient.backend.v1.linkedItem.linkedItemList.query({
            linkId: testLinkId,
            limit: 2,
            beforeId: lastItem.Id,
            beforeDateTime: lastItem.CreatedAtTimestamp,
          });

        expect(backwardPage).toBeDefined();
        expect(backwardPage.linkedItem).toBeDefined();

        // With desc order, "before" means items with higher timestamps
        backwardPage.linkedItem.forEach((item) => {
          expect(
            new Date(item.CreatedAtTimestamp).getTime()
          ).toBeGreaterThanOrEqual(
            new Date(lastItem.CreatedAtTimestamp).getTime()
          );
        });
      }
    }
  });

  it('first page should have hasPrev=false and prevId=null', async () => {
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: 3,
    });

    expect(result.pageMetadata.hasPrev).toBe(false);
    expect(result.pageMetadata.prevId).toBeNull();
    expect(result.pageMetadata.prevDateTime).toBeNull();
  });

  it('should handle pagination with different limit values', async () => {
    const limits = [1, 5, 10];

    for (const limit of limits) {
      const result =
        await trpcClient.backend.v1.linkedItem.linkedItemList.query({
          linkId: testLinkId,
          limit,
        });

      expect(result).toBeDefined();
      expect(result.linkedItem.length).toBeLessThanOrEqual(limit);
      expect(result.pageMetadata.count).toBe(result.linkedItem.length);
    }
  });

  it('should return empty result for non-existent linkId', async () => {
    const nonExistentLinkId = '00000000-0000-0000-0000-000000000000';
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: nonExistentLinkId,
    });

    expect(result).toBeDefined();
    expect(result.linkedItem).toBeDefined();
    expect(result.linkedItem.length).toBe(0);
    expect(result.pageMetadata.count).toBe(0);
    expect(result.pageMetadata.hasNext).toBe(false);
    expect(result.pageMetadata.hasPrev).toBe(false);
  });

  it('should maintain correct ordering by CreatedAtTimestamp', async () => {
    const result = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: 10,
    });

    if (result.linkedItem.length > 1) {
      for (let i = 1; i < result.linkedItem.length; i++) {
        const prevTimestamp = new Date(
          result.linkedItem[i - 1]!.CreatedAtTimestamp
        ).getTime();
        const currentTimestamp = new Date(
          result.linkedItem[i]!.CreatedAtTimestamp
        ).getTime();

        // Items should be in descending order (newest first) by default
        expect(currentTimestamp).toBeLessThanOrEqual(prevTimestamp);
      }
    }
  });

  it('round-trip: forward then backward returns the original page with no overlap', async () => {
    const page1 = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: 2,
    });

    if (
      !page1.pageMetadata.hasNext ||
      !page1.pageMetadata.nextId ||
      !page1.pageMetadata.nextDateTime
    ) {
      // Skip test if there aren't enough items
      return;
    }

    // Go forward
    const page2 = await trpcClient.backend.v1.linkedItem.linkedItemList.query({
      linkId: testLinkId,
      limit: 2,
      afterId: page1.pageMetadata.nextId,
      afterDateTime: page1.pageMetadata.nextDateTime,
    });

    expect(page2.linkedItem.length).toBeGreaterThan(0);

    // Verify no overlap between page1 and page2
    const page1Ids = page1.linkedItem.map((item) => item.Id);
    const page2Ids = page2.linkedItem.map((item) => item.Id);
    const forwardOverlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(forwardOverlap.length).toBe(0);

    // Go back using beforeId and beforeDateTime
    if (
      page2.pageMetadata.prevId &&
      page2.pageMetadata.prevDateTime &&
      page2.linkedItem.length > 0
    ) {
      const backTo1 =
        await trpcClient.backend.v1.linkedItem.linkedItemList.query({
          linkId: testLinkId,
          limit: 2,
          beforeId: page2.pageMetadata.prevId,
          beforeDateTime: page2.pageMetadata.prevDateTime,
        });

      // Should get back the original page
      const backTo1Ids = backTo1.linkedItem.map((item) => item.Id);
      expect(backTo1Ids).toStrictEqual(page1Ids);

      // Double-check: no overlap between backTo1 and page2
      const backwardOverlap = backTo1Ids.filter((id) => page2Ids.includes(id));
      expect(backwardOverlap.length).toBe(0);
    }
  });
});
