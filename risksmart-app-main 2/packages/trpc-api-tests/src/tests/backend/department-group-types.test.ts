import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend department group types', () => {
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

  it('should return a list of department group types with no args', async () => {
    const result =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query();

    expect(result).toBeDefined();
    expect(result.departmentGroupType).toBeDefined();
    expect(result.departmentGroupType.length).toBeGreaterThan(0);
    expect(result.departmentGroupType[0]?.Id).toBeTruthy();
  });

  it('should enforce limit on department group type list', async () => {
    const result =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query(
        { limit: 1 }
      );

    expect(result.departmentGroupType.length).toBeLessThanOrEqual(1);
  });

  it('should return correct page metadata structure', async () => {
    const result =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query(
        { limit: 1 }
      );

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(result.pageMetadata.count).toBe(result.departmentGroupType.length);
  });

  it('should return a department group type item by id', async () => {
    const listResult =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query();
    const expectedId = listResult.departmentGroupType[0]?.Id ?? '';

    const itemResult =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeById.query(
        { departmentGroupTypeId: expectedId }
      );

    expect(itemResult).toBeDefined();
    expect(itemResult?.departmentGroupType.Id).toStrictEqual(expectedId);
  });

  it('should return null for non-existent department group type id', async () => {
    const itemResult =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeById.query(
        { departmentGroupTypeId: '00000000-0000-0000-0000-000000000000' }
      );

    expect(itemResult).toBeNull();
  });

  it('should filter by Id', async () => {
    const listResult =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query();
    const targetId = listResult.departmentGroupType[0]?.Id ?? '';

    const result =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query(
        { filter: { Id: [targetId] } }
      );

    expect(result.departmentGroupType).toHaveLength(1);
    expect(result.departmentGroupType[0]?.Id).toBe(targetId);
  });

  it('should return empty list when filtering by non-existent Id', async () => {
    const result =
      await trpcClient.backend.v1.departmentGroupType.departmentGroupTypeList.query(
        { filter: { Id: ['00000000-0000-0000-0000-000000000000'] } }
      );

    expect(result.departmentGroupType).toHaveLength(0);
  });
});
