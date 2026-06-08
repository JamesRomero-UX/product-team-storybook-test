import { buildIssue, insertIssue } from '@risksmart-app/test-data';
import {
  createTestContext,
  type TestContext,
  waitForDbPropagation,
} from 'src/utils/test-context';
import { beforeAll, describe, expect, it } from 'vitest';

interface IssueDetail {
  id: string;
  title: string;
  customFields?: Record<string, unknown>;
}

describe('GET /api/v1/issues/:id', () => {
  let context: TestContext;
  let issueId: string;

  beforeAll(async () => {
    context = await createTestContext('issues:read');
    const { orgKey, userId } = context;

    const issue = buildIssue(orgKey, userId, {
      Title: 'Detail Test Issue',
    });

    const inserted = await insertIssue(issue);
    issueId = inserted!.Id;
    await waitForDbPropagation();
  });

  it('should return a single issue by id', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IssueDetail>(`/issues/${issueId}`);

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(issueId);
    expect(response.data.title).toEqual('Detail Test Issue');
  });

  it('should return 404 for a non-existent issue', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IssueDetail>(
      '/issues/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toEqual(404);
  });

  it('should return expanded custom fields when expand=customFields', async () => {
    const { httpClient } = context;

    const response = await httpClient.get<IssueDetail>(`/issues/${issueId}`, {
      params: { expand: 'customFields' },
    });

    expect(response.status).toEqual(200);
    expect(response.data.id).toEqual(issueId);
    expect(response.data.customFields).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const response = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/v1/issues/${issueId}`,
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

    const response = await limitedContext.httpClient.get<IssueDetail>(
      `/issues/${issueId}`
    );

    expect(response.status).toEqual(403);
  });
});
