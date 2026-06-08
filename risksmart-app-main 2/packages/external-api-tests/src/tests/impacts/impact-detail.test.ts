import { buildImpact, insertImpact } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface ImpactDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/impacts/:id', () => {
  let context: TestContext;
  let impactId: string;

  beforeAll(async () => {
    context = await createTestContext('impacts:read');
    const { orgKey, userId } = context;

    const impact = buildImpact({
      orgKey,
      userId,
      overrides: {
        Name: 'Detail Test Impact',
      },
    });

    const inserted = await insertImpact(impact);
    impactId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single impact by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ImpactDetail>(`/impacts/${impactId}`);

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(impactId);
    expect(response.data.title).toEqual('Detail Test Impact');
  });

  it('should return 404 for a non-existent impact', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ImpactDetail>(
      '/impacts/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ImpactDetail>(
      `/impacts/${impactId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(impactId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/impacts/${impactId}`,
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

    const response = await limitedContext.httpClient.get<ImpactDetail>(
      `/impacts/${impactId}`
    );

    expect(response.status).toEqual(403);
  });
});
