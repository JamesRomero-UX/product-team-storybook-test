import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend department types', () => {
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

  it('should return a list of department types with no args', async () => {
    const result =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query();

    expect(result).toBeDefined();
    expect(result.departmentType).toBeDefined();
    expect(result.departmentType.length).toBeGreaterThan(0);
    expect(result.departmentType[0]?.DepartmentTypeId).toBeTruthy();
  });

  it('should enforce limit on department type list', async () => {
    const result =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query({
        limit: 1,
      });

    expect(result.departmentType.length).toBeLessThanOrEqual(1);
  });

  it('should return correct page metadata structure', async () => {
    const result =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query({
        limit: 1,
      });

    expect(result.pageMetadata).toBeDefined();
    expect(typeof result.pageMetadata.hasNext).toBe('boolean');
    expect(typeof result.pageMetadata.hasPrev).toBe('boolean');
    expect(result.pageMetadata.count).toBe(result.departmentType.length);
  });

  it('should return a department type item by id', async () => {
    const listResult =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query();
    const expectedId = listResult.departmentType[0]?.DepartmentTypeId ?? '';

    const itemResult =
      await trpcClient.backend.v1.departmentType.departmentTypeById.query({
        departmentTypeId: expectedId,
      });

    expect(itemResult).toBeDefined();
    expect(itemResult?.departmentType.DepartmentTypeId).toStrictEqual(
      expectedId
    );
  });

  it('should return null for non-existent department type id', async () => {
    const itemResult =
      await trpcClient.backend.v1.departmentType.departmentTypeById.query({
        departmentTypeId: '00000000-0000-0000-0000-000000000000',
      });

    expect(itemResult).toBeNull();
  });

  it('should filter by Id', async () => {
    const listResult =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query();
    const targetId = listResult.departmentType[0]?.DepartmentTypeId ?? '';

    const result =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query({
        filter: { Id: [targetId] },
      });

    expect(result.departmentType).toHaveLength(1);
    expect(result.departmentType[0]?.DepartmentTypeId).toBe(targetId);
  });

  it('should return empty list when filtering by non-existent Id', async () => {
    const result =
      await trpcClient.backend.v1.departmentType.departmentTypeList.query({
        filter: { Id: ['00000000-0000-0000-0000-000000000000'] },
      });

    expect(result.departmentType).toHaveLength(0);
  });
});
