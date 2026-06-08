import { buildRisk, insertRisks } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface RiskListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  treatment: string;
  tier: number;
}

interface RiskListResponse {
  data: RiskListItem[];
  pageInfo: {
    count: number;
    nextPage: string;
    prevPage: string;
    beforeCursor: string | null;
    afterCursor: string | null;
    hasMore: boolean;
  };
}

describe('GET /api/v1/risks', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestContext('risks:read');
    const { orgKey, userId } = context;

    const risks = Array.from({ length: 4 }, (_, i) =>
      buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: `Test Risk ${i + 1}`,
          Description: `Test risk description ${i + 1}`,
        },
      })
    );

    await insertRisks(risks);
    await waitForDbPropagation();
  });

  it('should return a list of risks with valid token', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskListResponse>('/risks');

    expect(response.status).toEqual(200);
    expect(response.data.data).toBeDefined();
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });

  it('should get risk items returned in list from the api', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskListResponse>('/risks');
    expect(response.data.data.length).toBeGreaterThan(0);

    const riskItemId = response.data.data[0]!.id;
    const itemResponse = await httpClient.get<RiskListItem>(
      `/risks/${riskItemId}`
    );

    expect(itemResponse.status).toEqual(200);
    expect(itemResponse.data.title).toBeDefined();
  });

  it('should support pagination with limit parameter', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskListResponse>('/risks', {
      params: { page_size: 2 },
    });
    const nextPagePath = response.data.pageInfo.nextPage || '';

    const nextPageResponse = await httpClient.get<RiskListResponse>(
      nextPagePath.replace('/api/v1', '')
    );

    expect(response.status).toEqual(200);
    expect(response.data.data.length).toBeLessThanOrEqual(2);
    expect(response.data.pageInfo).toBeDefined();
    expect(response.data.pageInfo.nextPage).toBeDefined();
    expect(response.data.pageInfo.prevPage).toBeNull();
    expect(response.data.pageInfo.hasMore).toEqual(true);
    // next page checks
    expect(nextPageResponse.data.pageInfo.count).toEqual(2);
    expect(nextPageResponse.data.data.length).toEqual(2);
    expect(nextPageResponse.data.pageInfo.hasMore).toEqual(false);
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/risks`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toEqual(401);
  });

  it('should return 403 with insufficient scope', async () => {
    // Create context with a scope that doesn't include risks:read
    const limitedContext = await createTestContext('users:read');

    const response =
      await limitedContext.httpClient.get<RiskListResponse>('/risks');

    expect(response.status).toEqual(403);
  });
});
