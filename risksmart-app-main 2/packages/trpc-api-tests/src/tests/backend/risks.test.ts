import type { AppRouter } from '@risksmart-app/trpc/src/routers/router';
import { createTRPCClient, httpBatchLink, TRPCClientError } from '@trpc/client';
import { createAuthHeaders, generateTestToken } from 'src/utils/test-auth';
import superjson from 'superjson';
import { beforeAll, describe, expect, it } from 'vitest';

const baseUrl = process.env.TRPC_TEST_URL;

const ids = (rows: Array<{ SequentialId: number | null }>) =>
  rows.map((r) => r.SequentialId || 0);

const isDescending = (a: number[]) =>
  a.every((v, i) => i === 0 || (a[i - 1] ?? 0) > v);

describe('Backend risks', () => {
  let orgKey: string;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    orgKey = 'org_Qshp7tYsxxAWwhVa';
    const testExtApiJwt = await generateTestToken({
      org_id: orgKey,
      scope: 'read:risks',
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

  it('should return a list of linked risk approvals using valid token', async () => {
    const expectedRiskId = 'b2781d16-4827-4d81-a9ba-9402e0c56f7f';
    const result = await trpcClient.backend.v1.risk.riskApprovalsList.query({
      linkId: expectedRiskId,
    });
    expect(result).toBeDefined();
    expect(result.approval).toBeDefined();
  });

  it('should return a list of linked risk acceptance results using valid token', async () => {
    const expectedRiskId = 'b2781d16-4827-4d81-a9ba-9402e0c56f7f';
    const result = await trpcClient.backend.v1.risk.riskAcceptancesList.query({
      linkId: expectedRiskId,
    });
    const riskAcceptanceId = result.acceptance[0]?.Id ?? '';
    const acceptanceResult =
      await trpcClient.backend.v1.acceptance.acceptanceById.query({
        id: riskAcceptanceId,
      });
    expect(result).toBeDefined();
    expect(result.acceptance).toBeDefined();
    expect(riskAcceptanceId).toBeDefined();
    expect(acceptanceResult?.acceptance.Id).toEqual(riskAcceptanceId);
  });

  it('should return a list of linked risk assessment results using valid token', async () => {
    const expectedRiskId = 'b2781d16-4827-4d81-a9ba-9402e0c56f7f';
    const result =
      await trpcClient.backend.v1.risk.riskAssessmentResultsList.query({
        linkId: expectedRiskId,
      });
    const riskAssessmentId = result.riskAssessmentResult[0]?.Id ?? '';
    const riskAssessmentResult =
      await trpcClient.backend.v1.assessment.riskAssessmentResultById.query({
        id: riskAssessmentId,
      });
    expect(result).toBeDefined();
    expect(result.riskAssessmentResult).toBeDefined();
    expect(riskAssessmentId).toBeDefined();
    expect(riskAssessmentResult?.riskAssessmentResult.Id).toEqual(
      riskAssessmentId
    );
  });

  it('should return a list of linked risk impact ratings using valid token', async () => {
    const expectedRiskId = 'b2781d16-4827-4d81-a9ba-9402e0c56f7f';
    const result = await trpcClient.backend.v1.risk.riskImpactRatingsList.query(
      { linkId: expectedRiskId }
    );
    const impactRatingId = result.impactRating[0]?.Id ?? '';
    const impactRatingResult =
      await trpcClient.backend.v1.impactRating.impactRatingById.query({
        id: impactRatingId,
      });
    expect(result).toBeDefined();
    expect(result.impactRating).toBeDefined();
    expect(impactRatingResult?.impactRating.SequentialId).toBeDefined();
  });

  it('should return a list of linked risk appetites using a valid token', async () => {
    const expectedRiskId = 'a1d30192-8100-46b1-a584-6db81b22f935';
    const result = await trpcClient.backend.v1.risk.riskAppetitesList.query({
      linkId: expectedRiskId,
    });
    const appetiteId = result.appetite[0]?.Id ?? '';
    const appetiteResult =
      await trpcClient.backend.v1.appetite.appetiteById.query({
        id: appetiteId,
      });
    expect(result).toBeDefined();
    expect(result.appetite).toBeDefined();
    expect(appetiteResult?.appetite.SequentialId).toBeDefined();
  });

  it('should return a list of linked risk indicators using valid token', async () => {
    const result = await trpcClient.backend.v1.risk.riskList.query();
    const riskItemId = result.risk[0]?.Id ?? '';
    const indicatorsResult =
      await trpcClient.backend.v1.risk.riskIndicatorsList.query({
        linkId: riskItemId,
      });
    expect(indicatorsResult).toBeDefined();
    expect(indicatorsResult.indicator).toBeDefined();
  });

  it('should return a list of linked risk actions using valid token', async () => {
    const riskItemId = 'a1d30192-8100-46b1-a584-6db81b22f935';
    const actionsResult =
      await trpcClient.backend.v1.risk.riskActionsList.query({
        linkId: riskItemId,
      });
    expect(actionsResult).toBeDefined();
    expect(actionsResult.action).toBeDefined();
    expect(actionsResult.action.length).toBeGreaterThan(0);
  });

  it('should return a list of linked risk controls with using valid token', async () => {
    const result = await trpcClient.backend.v1.risk.riskList.query();
    const riskItemId = result.risk.at(-1)?.Id ?? '';
    const controlsResult =
      await trpcClient.backend.v1.risk.riskControlsList.query({
        linkId: riskItemId,
      });
    expect(controlsResult).toBeDefined();
    expect(controlsResult.control).toBeDefined();
    expect(controlsResult.control.length).toBeGreaterThan(0);
  });

  it('should return a list of risks with using valid token', async () => {
    const result = await trpcClient.backend.v1.risk.riskList.query();

    expect(result).toBeDefined();
    expect(result.risk).toBeDefined();
    expect(result.risk.length).toBeGreaterThan(0);
  });

  it('should return a list of risks with a limit enforced', async () => {
    const expectedLimit = 3;
    const result = await trpcClient.backend.v1.risk.riskList.query({
      limit: expectedLimit,
    });

    expect(result).toBeDefined();
    expect(result.risk).toBeDefined();
    expect(result.risk.length).toBe(expectedLimit);
  });

  it('should return a list of risks since an id value', async () => {
    const all = await trpcClient.backend.v1.risk.riskList.query();
    const cursor = all.risk[0]!.SequentialId!;
    const result = await trpcClient.backend.v1.risk.riskList.query({
      afterSequentialId: cursor,
    });

    expect(result).toBeDefined();
    expect(result.risk).toBeDefined();
    expect(result.risk[0]?.SequentialId).toBeLessThan(cursor);
  });

  it('should return a list of risks before an id value', async () => {
    const all = await trpcClient.backend.v1.risk.riskList.query();
    const cursor = all.risk.at(-1)!.SequentialId!;
    const result = await trpcClient.backend.v1.risk.riskList.query({
      beforeSequentialId: cursor,
      limit: 1,
    });

    expect(result).toBeDefined();
    expect(result.risk).toBeDefined();
    expect(result.risk[0]?.SequentialId).toBeGreaterThan(cursor);
  });

  it('should reject when both afterId and beforeId are provided', async () => {
    const expectedErrorMessage =
      'Do not provide both "afterSequentialId" and "beforeSequentialId".';

    try {
      await trpcClient.backend.v1.risk.riskList.query({
        afterSequentialId: 5,
        beforeSequentialId: 10,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCClientError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = JSON.parse((e as TRPCClientError<any>).message) as Array<{
        code: string;
        message: string;
        path: string[];
      }>;

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'custom',
            message: expectedErrorMessage,
            path: ['afterSequentialId'],
          }),
          expect.objectContaining({
            code: 'custom',
            message: expectedErrorMessage,
            path: ['beforeSequentialId'],
          }),
        ])
      );
    }
  });

  it('first page is descending, hasPrev=false, prevId=null', async () => {
    const res = await trpcClient.backend.v1.risk.riskList.query({ limit: 3 });

    const pageMeta = res.pageMetadata;

    expect(res.risk.length).toBeLessThanOrEqual(3);
    expect(isDescending(ids(res.risk))).toBe(true);
    expect(pageMeta.hasPrev).toBe(false);
    expect(pageMeta.prevId).toBeNull();
    // hasNext true iff we got the +1 row back
    expect(typeof pageMeta.hasNext).toBe('boolean');
    expect(pageMeta.count).toBe(res.risk.length);
    if (pageMeta.hasNext) {
      expect(pageMeta.nextId).toBe(res.risk.at(-1)?.SequentialId ?? null);
    } else {
      expect(pageMeta.nextId).toBeNull();
    }
  });

  it('next page starts after previous last id (no overlap)', async () => {
    const first = await trpcClient.backend.v1.risk.riskList.query({ limit: 2 });
    const next = await trpcClient.backend.v1.risk.riskList.query({
      limit: 2,
      afterSequentialId:
        ((first.pageMetadata.nextId ??
          first.risk.at(-1)?.SequentialId) as number) ?? 0,
    });

    const a = ids(first.risk);
    const b = ids(next.risk);

    if (next.risk.length > 0) {
      expect(b[0]).toBeLessThan(a.at(-1)!);
    }
    // No duplicates across pages
    const union = new Set([...a, ...b]);
    expect(union.size).toBe(a.length + b.length);
    expect(isDescending(b)).toBe(true);
  });

  it('backward page (beforeId) returns items above the cursor, descending; prevId only if newer rows exist', async () => {
    // Get a forward page to find a middle id
    const first = await trpcClient.backend.v1.risk.riskList.query({ limit: 3 });
    const beforeId = first.risk.at(-1)!.SequentialId;

    const back = await trpcClient.backend.v1.risk.riskList.query({
      beforeSequentialId: beforeId,
      limit: 2,
    });

    const b = ids(back.risk);
    expect(isDescending(b)).toBe(true);
    // With desc order, "before" means higher IDs
    b.forEach((v) => expect(v).toBeGreaterThan(Number(beforeId)));

    // nextId points to the last item of this page.
    expect(back.pageMetadata.nextId).toBe(
      back.risk.at(-1)?.SequentialId ?? null
    );

    if (back.pageMetadata.hasPrev) {
      expect(back.pageMetadata.prevId).toBe(
        back.risk.at(0)?.SequentialId ?? null
      );
    } else {
      expect(back.pageMetadata.prevId).toBeNull();
    }

    expect(back.pageMetadata.count).toBe(back.risk.length);
  });

  it('round-trip: forward then backward returns the original page', async () => {
    const page1 = await trpcClient.backend.v1.risk.riskList.query({ limit: 2 });
    // Go forward
    const page2 = await trpcClient.backend.v1.risk.riskList.query({
      limit: 2,
      afterSequentialId:
        ((page1.pageMetadata.nextId ??
          page1.risk.at(-1)?.SequentialId) as number) ?? 0,
    });
    // Go back using beforeId
    const backTo1 = await trpcClient.backend.v1.risk.riskList.query({
      limit: 2,
      beforeSequentialId:
        ((page2.pageMetadata.prevId ??
          page2.risk.at(0)?.SequentialId) as number) ?? 0,
    });

    expect(ids(backTo1.risk)).toStrictEqual(ids(page1.risk));
  });

  it('afterId beyond max yields empty page with hasNext=false and hasPrev=true', async () => {
    // Find a max-ish id by fetching a large page to limit
    const many = await trpcClient.backend.v1.risk.riskList.query({
      limit: 1000,
    });
    const maxId = many.risk.at(-1)?.SequentialId ?? 0;

    const res = await trpcClient.backend.v1.risk.riskList.query({
      afterSequentialId: maxId,
      limit: 5,
    });

    expect(res.risk).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(true);
    expect(res.pageMetadata.prevId).toBe(maxId);
    expect(res.pageMetadata.nextId).toBeNull();
    expect(res.pageMetadata.count).toBe(0);
  });

  it('beforeId at the minimum yields empty page with hasPrev=false', async () => {
    // Get the absolute min by taking the first item of the first page
    const first = await trpcClient.backend.v1.risk.riskList.query({ limit: 1 });
    const minId = first.risk[0]?.SequentialId ?? 1;

    const res = await trpcClient.backend.v1.risk.riskList.query({
      beforeSequentialId: minId,
      limit: 5,
    });

    expect(res.risk).toHaveLength(0);
    expect(res.pageMetadata.hasNext).toBe(false);
    expect(res.pageMetadata.hasPrev).toBe(false);
    expect(res.pageMetadata.prevId).toBeNull();
    expect(res.pageMetadata.nextId).toBeNull();
  });

  it('limit is min 1 at the lower bound', async () => {
    try {
      await trpcClient.backend.v1.risk.riskList.query({ limit: 0 });
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCClientError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = JSON.parse((e as TRPCClientError<any>).message) as Array<{
        code: string;
        message: string;
        path: string[];
      }>;

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'too_small',
            message: 'must be 1 or greater',
            path: ['limit'],
          }),
        ])
      );
    }
  });

  it('limit is set at max for the upper bound', async () => {
    try {
      await trpcClient.backend.v1.risk.riskList.query({ limit: 2000 });
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCClientError);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = JSON.parse((e as TRPCClientError<any>).message) as Array<{
        code: string;
        message: string;
        path: string[];
      }>;

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'too_big',
            message: 'must be 1000 or less',
            path: ['limit'],
          }),
        ])
      );
    }
  });

  it('nextId/prevId align with page boundaries', async () => {
    const res = await trpcClient.backend.v1.risk.riskList.query({ limit: 3 });
    if (res.pageMetadata.hasNext) {
      expect(res.pageMetadata.nextId).toBe(
        res.risk.at(-1)?.SequentialId ?? null
      );
    } else {
      expect(res.pageMetadata.nextId).toBeNull();
    }
    if (res.pageMetadata.hasPrev) {
      expect(res.pageMetadata.prevId).toBeNull();
    }
  });
});
