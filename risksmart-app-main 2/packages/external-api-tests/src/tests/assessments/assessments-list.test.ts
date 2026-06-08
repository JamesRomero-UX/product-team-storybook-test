import { buildAssessment, insertAssessments } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface AssessmentListItem {
  id: string;
  title: string;
}

interface AssessmentListResponse {
  data: AssessmentListItem[];
  pageInfo: {
    count: number;
    nextPage: string;
    prevPage: string;
    beforeCursor: string | null;
    afterCursor: string | null;
    hasMore: boolean;
  };
}

describe('GET /api/v1/assessments', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestContext('assessments:read');
    const { orgKey, userId } = context;

    const assessments = Array.from({ length: 4 }, (_, i) =>
      buildAssessment(orgKey, userId, {
        Title: `Test Assessment ${i + 1}`,
      })
    );

    await insertAssessments(assessments);
    await waitForDbPropagation();
  });

  it('should return a list of assessments with valid token', async () => {
    const { httpClient } = context;

    const response =
      await httpClient.get<AssessmentListResponse>('/assessments');

    expect(response.status).toEqual(200);
    expect(response.data.data).toBeDefined();
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });

  it('should get assessment item returned in list from the api', async () => {
    const { httpClient } = context;

    const response =
      await httpClient.get<AssessmentListResponse>('/assessments');
    expect(response.data.data.length).toBeGreaterThan(0);

    const assessmentItemId = response.data.data[0]!.id;
    const itemResponse = await httpClient.get<AssessmentListItem>(
      `/assessments/${assessmentItemId}`
    );

    expect(itemResponse.status).toEqual(200);
    expect(itemResponse.data.title).toBeDefined();
  });

  it('should support pagination with limit parameter', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<AssessmentListResponse>(
      '/assessments',
      {
        params: { page_size: 2 },
      }
    );
    const nextPagePath = response.data.pageInfo.nextPage || '';

    const nextPageResponse = await httpClient.get<AssessmentListResponse>(
      nextPagePath.replace('/api/v1', '')
    );

    expect(response.status).toEqual(200);
    expect(response.data.data.length).toBeLessThanOrEqual(2);
    expect(response.data.pageInfo).toBeDefined();
    expect(response.data.pageInfo.nextPage).toBeDefined();
    expect(response.data.pageInfo.prevPage).toBeNull();
    expect(response.data.pageInfo.hasMore).toEqual(true);
    expect(nextPageResponse.data.pageInfo.count).toEqual(2);
    expect(nextPageResponse.data.data.length).toEqual(2);
    expect(nextPageResponse.data.pageInfo.hasMore).toEqual(false);
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/assessments`,
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
    const limitedContext = await createTestContext('users:read');

    const response =
      await limitedContext.httpClient.get<AssessmentListResponse>(
        '/assessments'
      );

    expect(response.status).toEqual(403);
  });
});
