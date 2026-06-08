import { buildAssessment, insertAssessment } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface AssessmentDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/assessments/:id', () => {
  let context: TestContext;
  let assessmentId: string;

  beforeAll(async () => {
    context = await createTestContext('assessments:read');
    const { orgKey, userId } = context;

    const assessment = buildAssessment(orgKey, userId, {
      Title: 'Detail Test Assessment',
    });

    const inserted = await insertAssessment(assessment);
    assessmentId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single assessment by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<AssessmentDetail>(
      `/assessments/${assessmentId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(assessmentId);
    expect(response.data.title).toEqual('Detail Test Assessment');
  });

  it('should return 404 for a non-existent assessment', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<AssessmentDetail>(
      '/assessments/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<AssessmentDetail>(
      `/assessments/${assessmentId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(assessmentId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/assessments/${assessmentId}`,
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

    const response = await limitedContext.httpClient.get<AssessmentDetail>(
      `/assessments/${assessmentId}`
    );

    expect(response.status).toEqual(403);
  });
});
