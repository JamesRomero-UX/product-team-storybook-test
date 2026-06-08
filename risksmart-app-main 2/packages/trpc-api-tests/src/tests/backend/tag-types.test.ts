import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend tag types', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
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

  it('should return a list of tag types with no args', async () => {
    const result = await trpcClient.backend.v1.tagType.tagTypeList.query();

    expect(result).toBeDefined();
    expect(result.tagType).toBeDefined();
    expect(result.tagType.length).toBeGreaterThan(0);
    expect(result.tagType[0]?.TagTypeId).toBeTruthy();
  });

  it('should enforce limit on tag type list', async () => {
    const result = await trpcClient.backend.v1.tagType.tagTypeList.query({
      limit: 1,
    });

    expect(result.tagType.length).toBeLessThanOrEqual(1);
  });

  it('should return correct page metadata structure', async () => {
    const result = await trpcClient.backend.v1.tagType.tagTypeList.query({
      limit: 1,
    });

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(result.pageMetadata.count).toBe(result.tagType.length);
  });

  it('should return a tag type item by id', async () => {
    const listResult = await trpcClient.backend.v1.tagType.tagTypeList.query();
    const expectedId = listResult.tagType[0]?.TagTypeId ?? '';

    const itemResult = await trpcClient.backend.v1.tagType.tagTypeById.query({
      tagTypeId: expectedId,
    });

    expect(itemResult).toBeDefined();
    expect(itemResult?.tagType.TagTypeId).toStrictEqual(expectedId);
  });

  it('should return null for non-existent tag type id', async () => {
    const itemResult = await trpcClient.backend.v1.tagType.tagTypeById.query({
      tagTypeId: '00000000-0000-0000-0000-000000000000',
    });

    expect(itemResult).toBeNull();
  });

  it('should filter by Id', async () => {
    const listResult = await trpcClient.backend.v1.tagType.tagTypeList.query();
    const targetId = listResult.tagType[0]?.TagTypeId ?? '';

    const result = await trpcClient.backend.v1.tagType.tagTypeList.query({
      filter: { Id: [targetId] },
    });

    expect(result.tagType).toHaveLength(1);
    expect(result.tagType[0]?.TagTypeId).toBe(targetId);
  });

  it('should return empty list when filtering by non-existent Id', async () => {
    const result = await trpcClient.backend.v1.tagType.tagTypeList.query({
      filter: { Id: ['00000000-0000-0000-0000-000000000000'] },
    });

    expect(result.tagType).toHaveLength(0);
  });
});
