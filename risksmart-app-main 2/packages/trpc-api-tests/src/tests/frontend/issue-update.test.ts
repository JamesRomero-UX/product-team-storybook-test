import {
  buildIssue,
  buildIssueUpdate,
  insertIssue,
  insertIssueUpdate,
} from '@risksmart-app/test-data';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('issue update', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];
  let context: Awaited<ReturnType<typeof createTestContext>>;

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  beforeAll(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  describe('issue updates register', () => {
    it('should return a list of updates for a given issue id when using valid token', async () => {
      const { orgKey, userId, trpcClient } = context;

      const builtIssue = buildIssue(orgKey, userId);

      const builtIssueUpdate = buildIssueUpdate({
        orgKey,
        userId,
        issueId: builtIssue.Id!,
      });

      const insertedIssue = await insertIssue(builtIssue);

      if (!insertedIssue) {
        throw new Error('Failed to insert issue');
      }

      const insertedIssueUpdate = await insertIssueUpdate(builtIssueUpdate);

      if (!insertedIssueUpdate) {
        throw new Error('Failed to insert issue update');
      }

      const response = await trpcClient.frontend.issueUpdate.register.query({
        parentIssueId: builtIssue.Id!,
      });

      expect(response.length).toEqual(1);

      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: builtIssueUpdate.Id,
          ParentIssueId: builtIssueUpdate.ParentIssueId,
          Title: builtIssueUpdate.Title,
          Description: builtIssueUpdate.Description,
          CreatedByUser: builtIssueUpdate.CreatedByUser,
          ModifiedByUser: builtIssueUpdate.ModifiedByUser,
          createdByUser: { FriendlyName: 'Test User' },
          files: [],
        })
      );
    });
  });

  describe('delete issue update', () => {
    it('should delete an existing issue update', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueInput = buildIssue(orgKey, userId);
      const insertedIssue = await insertIssue(issueInput);

      if (!insertedIssue) {
        throw new Error('Failed to insert issue');
      }

      const issueUpdateInput = buildIssueUpdate({
        orgKey,
        userId,
        issueId: insertedIssue.Id,
      });

      const insertedIssueUpdate = await insertIssueUpdate(issueUpdateInput);

      if (!insertedIssueUpdate) {
        throw new Error('Failed to insert issue update');
      }

      await trpcClient.frontend.issueUpdate.delete.mutate({
        ids: [insertedIssueUpdate.Id],
      });

      const response = await trpcClient.frontend.issueUpdate.register.query({
        parentIssueId: insertedIssueUpdate.ParentIssueId,
      });

      expect(response).toEqual([]);
    });
  });
});
