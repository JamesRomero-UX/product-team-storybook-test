import { buildObligation, insertObligation } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface ObligationDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/compliance/obligations/:id', () => {
  let context: TestContext;
  let obligationId: string;

  beforeAll(async () => {
    context = await createTestContext('obligations:read');
    const { orgKey, userId } = context;

    const obligation = buildObligation({
      orgKey,
      userId,
      overrides: {
        Title: 'Detail Test Obligation',
      },
    });

    const inserted = await insertObligation(obligation);
    obligationId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single obligation by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ObligationDetail>(
      `/compliance/obligations/${obligationId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(obligationId);
    expect(response.data.title).toEqual('Detail Test Obligation');
  });

  it('should return 404 for a non-existent obligation', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ObligationDetail>(
      '/compliance/obligations/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ObligationDetail>(
      `/compliance/obligations/${obligationId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(obligationId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/compliance/obligations/${obligationId}`,
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

    const response = await limitedContext.httpClient.get<ObligationDetail>(
      `/compliance/obligations/${obligationId}`
    );

    expect(response.status).toEqual(403);
  });
});
