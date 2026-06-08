import { buildControl, insertControl } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface ControlDetail {
  id: string;
  title: string;
  description: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/controls/:id', () => {
  let context: TestContext;
  let controlId: string;

  beforeAll(async () => {
    context = await createTestContext('controls:read');
    const { orgKey, userId } = context;

    const control = buildControl(orgKey, userId, {
      Title: 'Detail Test Control',
      Description: 'Control for detail endpoint test',
    });

    const inserted = await insertControl(control);
    controlId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single control by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ControlDetail>(
      `/controls/${controlId}`
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(controlId);
    expect(response.data.title).toEqual('Detail Test Control');
    expect(response.data.description).toEqual(
      'Control for detail endpoint test'
    );
  });

  it('should return 404 for a non-existent control', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ControlDetail>(
      '/controls/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ControlDetail>(
      `/controls/${controlId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(controlId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/controls/${controlId}`,
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

    const response = await limitedContext.httpClient.get<ControlDetail>(
      `/controls/${controlId}`
    );

    expect(response.status).toEqual(403);
  });
});
