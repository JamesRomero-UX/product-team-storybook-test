import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { buildRisk, insertRisk } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface RiskDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  treatment: string;
  tier: number;
  customFields?: Record<
    string,
    {
      data: {
        id: string;
        value: unknown;
        label?: string;
      };
      metadata?: {
        kind: string;
        description: string | null;
        hidden: boolean;
        readOnly: boolean;
        required: boolean;
        defaultValue: unknown;
        enum: string[] | null;
        format: string | null;
        uniqueItems: boolean;
      } | null;
    }
  >;
}

describe('GET /api/v1/risks/:id', () => {
  let context: TestContext;
  let risk: InferInsertModel<'risk'>;

  beforeAll(async () => {
    context = await createTestContext('risks:read');
    const { orgKey, userId } = context;

    risk = buildRisk({
      orgKey,
      userId,
      overrides: {
        Title: 'Detail Test Risk',
        Description: 'Risk for detail endpoint test',
      },
    });

    await insertRisk(risk);
    await waitForDbPropagation();
  });

  it('should return a single risk by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskDetail>(`/risks/${risk.Id}`);

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(risk.Id);
    expect(response.data.title).toEqual('Detail Test Risk');
    expect(response.data.description).toEqual('Risk for detail endpoint test');
  });

  it('should return 404 for a non-existent risk', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskDetail>(
      '/risks/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<RiskDetail>(`/risks/${risk.Id}`, {
      params: { expand: 'customFields' },
    });

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(risk.Id);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/risks/${risk.Id}`,
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

    const response = await limitedContext.httpClient.get<RiskDetail>(
      `/risks/${risk.Id}`
    );

    expect(response.status).toEqual(403);
  });
});
