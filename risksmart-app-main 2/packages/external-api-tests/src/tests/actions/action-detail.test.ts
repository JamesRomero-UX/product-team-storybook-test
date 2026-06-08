import { buildAction, insertAction } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface ActionDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/actions/:id', () => {
  let context: TestContext;
  let actionId: string;

  beforeAll(async () => {
    context = await createTestContext('actions:read');
    const { orgKey, userId } = context;

    const action = buildAction(orgKey, userId, {
      Title: 'Detail Test Action',
    });

    const inserted = await insertAction(action);
    actionId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single action by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ActionDetail>(`/actions/${actionId}`);

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(actionId);
    expect(response.data.title).toEqual('Detail Test Action');
  });

  it('should return 404 for a non-existent action', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ActionDetail>(
      '/actions/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<ActionDetail>(
      `/actions/${actionId}`,
      {
        params: { expand: 'customFields' },
      }
    );

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(actionId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/actions/${actionId}`,
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

    const response = await limitedContext.httpClient.get<ActionDetail>(
      `/actions/${actionId}`
    );

    expect(response.status).toEqual(403);
  });
});
