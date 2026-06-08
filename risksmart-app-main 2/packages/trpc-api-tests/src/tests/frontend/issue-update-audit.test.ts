import {
  buildIssueUpdateAudit,
  insertIssueUpdateAudit,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('issue update audit', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('should return issue update audit record for a given id', async () => {
    const { orgKey, userId, trpcClient } = context;

    const id = randomUUID();
    const issueId = randomUUID();
    const record = buildIssueUpdateAudit({
      orgKey,
      userId,
      issueId,
      overrides: {
        Id: id,
        Action: 'INSERT',
      },
    });

    await insertIssueUpdateAudit(record);

    const response = await trpcClient.frontend.issueUpdateAudit.getById.query({
      id,
    });

    expect(response.length).toEqual(1);

    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: id,
        Title: record.Title,
        Description: record.Description,
        ParentIssueId: issueId,
        Action: 'INSERT',
        CreatedByUser: userId,
        ModifiedByUser: userId,
      })
    );
  });
});
