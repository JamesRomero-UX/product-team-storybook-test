import { buildIndicator, insertIndicator } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface IndicatorDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/indicators/:id', () => {
  let context: TestContext;
  let indicatorId: string;

  beforeAll(async () => {
    context = await createTestContext('indicators:read');
    const { orgKey, userId } = context;

    const indicator = buildIndicator({
      orgKey,
      userId,
      overrides: {
        Title: 'Detail Test Indicator',
      },
    });

    const inserted = await insertIndicator(indicator);
    indicatorId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single indicator by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IndicatorDetail>(
      `/indicators/${indicatorId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(indicatorId);
    expect(response.data.title).toEqual('Detail Test Indicator');
  });

  it('should return 404 for a non-existent indicator', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IndicatorDetail>(
      '/indicators/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IndicatorDetail>(
      `/indicators/${indicatorId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(indicatorId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/indicators/${indicatorId}`,
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

    const response = await limitedContext.httpClient.get<IndicatorDetail>(
      `/indicators/${indicatorId}`
    );

    expect(response.status).toEqual(403);
  });
});
