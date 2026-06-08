import { buildDocument, insertDocument } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface PolicyDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/policies/:id', () => {
  let context: TestContext;
  let policyId: string;

  beforeAll(async () => {
    context = await createTestContext('policies:read');
    const { orgKey, userId } = context;

    const policy = buildDocument(orgKey, userId, {
      Title: 'Detail Test Policy',
      DocumentType: 'Policy',
    });

    const inserted = await insertDocument(policy);
    policyId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single policy by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<PolicyDetail>(
      `/policies/${policyId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(policyId);
    expect(response.data.title).toEqual('Detail Test Policy');
  });

  it('should return 404 for a non-existent policy', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<PolicyDetail>(
      '/policies/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<PolicyDetail>(
      `/policies/${policyId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(policyId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/policies/${policyId}`,
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

    const response = await limitedContext.httpClient.get<PolicyDetail>(
      `/policies/${policyId}`
    );

    expect(response.status).toEqual(403);
  });
});
