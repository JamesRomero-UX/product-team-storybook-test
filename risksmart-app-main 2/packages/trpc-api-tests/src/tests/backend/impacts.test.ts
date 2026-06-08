import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

describe('Backend impacts', () => {
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

  it('should return a list of impacts with using valid token', async () => {
    const result = await trpcClient.backend.v1.impact.impactList.query();

    expect(result).toBeDefined();
    expect(result.impact).toBeDefined();
    expect(result.impact.length).toBeGreaterThan(0);
    expect(result.impact[0]?.Id).toBeTruthy();
  });

  it('should return an impact item with a valid token', async () => {
    const listResult = await trpcClient.backend.v1.impact.impactList.query();
    const expectedId = listResult.impact[0]?.Id || '';
    const itemResult = await trpcClient.backend.v1.impact.impactById.query({
      id: expectedId,
    });

    expect(itemResult?.impact.Id).toStrictEqual(expectedId);
  });
});
