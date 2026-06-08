import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend assessments', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:assessments',
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

  it('should return a list of assessments with using valid token', async () => {
    const result =
      await trpcClient.backend.v1.assessment.assessmentList.query();

    expect(result).toBeDefined();
    expect(result.assessment).toBeDefined();
    expect(result.assessment.length).toBeGreaterThan(0);
    expect(result.assessment[0]?.SequentialId).toBeTruthy();
  });

  it('should return a assessment item with a valid token', async () => {
    const listResult =
      await trpcClient.backend.v1.assessment.assessmentList.query();

    expect(listResult.assessment.length).toBeGreaterThan(0);

    const expectedId = listResult.assessment[0]!.Id;
    const itemResult =
      await trpcClient.backend.v1.assessment.assessmentById.query({
        assessmentId: expectedId,
      });

    expect(itemResult?.assessment.Id).toStrictEqual(expectedId);
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.assessment.assessmentList.query({
      limit: 1000,
    });
    const maxId = many.assessment.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.assessment.assessmentList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.assessment).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });
});
