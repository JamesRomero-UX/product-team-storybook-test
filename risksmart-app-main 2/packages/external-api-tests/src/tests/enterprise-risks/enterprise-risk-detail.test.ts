import {
  buildEnterpriseRisk,
  insertEnterpriseRisk,
} from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface EnterpriseRiskDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/enterprise-risks/:id', () => {
  let context: TestContext;
  let enterpriseRiskId: string;

  beforeAll(async () => {
    context = await createTestContext('enterprise-risks:read');
    const { orgKey, userId } = context;

    const enterpriseRisk = buildEnterpriseRisk({
      orgKey,
      userId,
      overrides: {
        Title: 'Detail Test Enterprise Risk',
      },
    });

    const inserted = await insertEnterpriseRisk(enterpriseRisk);
    enterpriseRiskId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single enterprise risk by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<EnterpriseRiskDetail>(
      `/enterprise-risks/${enterpriseRiskId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(enterpriseRiskId);
    expect(response.data.title).toEqual('Detail Test Enterprise Risk');
  });

  it('should return 404 for a non-existent enterprise risk', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<EnterpriseRiskDetail>(
      '/enterprise-risks/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<EnterpriseRiskDetail>(
      `/enterprise-risks/${enterpriseRiskId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(enterpriseRiskId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/enterprise-risks/${enterpriseRiskId}`,
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

    const response = await limitedContext.httpClient.get<EnterpriseRiskDetail>(
      `/enterprise-risks/${enterpriseRiskId}`
    );

    expect(response.status).toEqual(403);
  });
});
