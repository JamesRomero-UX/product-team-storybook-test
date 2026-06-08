import {
  buildCause,
  buildIssue,
  insertCause,
  insertIssue,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('cause', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('register', () => {
    it('should return correct data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueId = randomUUID();
      await insertIssue(buildIssue(orgKey, userId, { Id: issueId }));

      const causeId = randomUUID();
      const causeData = buildCause({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: causeId },
      });
      await insertCause(causeData);
      await insertCause(buildCause({ orgKey, userId, parentIssueId: issueId }));

      const response = await trpcClient.frontend.cause.register.query();

      expect(response.cause.length).toEqual(2);
      expect(response.cause).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: causeId,
            Title: causeData.Title,
            Description: causeData.Description,
            Significance: causeData.Significance,
            ParentIssueId: issueId,
          }),
        ])
      );
    });

    it('should return empty array for new org', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.cause.register.query();

      expect(response.cause).toEqual([]);
    });
  });

  describe('getByParentIssueId', () => {
    it('should return causes for an issue', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueId = randomUUID();
      await insertIssue(buildIssue(orgKey, userId, { Id: issueId }));

      const causeId = randomUUID();
      const causeData = buildCause({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: causeId },
      });
      await insertCause(causeData);
      await insertCause(buildCause({ orgKey, userId, parentIssueId: issueId }));

      const response = await trpcClient.frontend.cause.getByParentIssueId.query(
        {
          issueId,
        }
      );

      expect(response.length).toEqual(2);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: causeId,
            Title: causeData.Title,
            ParentIssueId: issueId,
          }),
        ])
      );
    });

    it('should return empty for non-existent issue', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.cause.getByParentIssueId.query(
        {
          issueId: randomUUID(),
        }
      );

      expect(response).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return correct data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueId = randomUUID();
      await insertIssue(buildIssue(orgKey, userId, { Id: issueId }));

      const causeId = randomUUID();
      const causeData = buildCause({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: causeId },
      });
      await insertCause(causeData);

      const response = await trpcClient.frontend.cause.getById.query({
        causeId,
      });

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: causeId,
          Title: causeData.Title,
          Description: causeData.Description,
          Significance: causeData.Significance,
          ParentIssueId: issueId,
        })
      );
    });

    it('should return empty for non-existent id', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.cause.getById.query({
        causeId: randomUUID(),
      });

      expect(response).toEqual([]);
    });
  });

  describe('insert', () => {
    it('should insert a cause with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.cause.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'Required fields only',
        Description: 'A description of the cause',
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should insert a cause with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.cause.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'All optional fields',
        Description: 'A detailed description of the cause',
        Significance: 3,
        CustomAttributeData: { customField: 'value', count: 42 },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a cause with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.cause.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'Null optional fields',
        Description: 'A description with null optional fields',
        Significance: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with an empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      await expect(
        trpcClient.frontend.cause.insert.mutate({
          ParentIssueId: parentIssue.Id!,
          Title: '',
          Description: 'A description',
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid UUID for ParentIssueId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.cause.insert.mutate({
          ParentIssueId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Valid title',
          Description: 'A description',
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a cause with new values', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const cause = await insertCause(
        buildCause({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
        })
      );
      if (!cause) {
        throw new Error('Failed to insert cause');
      }

      await trpcClient.frontend.cause.update.mutate({
        Id: cause.Id,
        ParentIssueId: parentIssue.Id!,
        Title: 'Updated Cause Title',
        Description: 'Updated description',
        Significance: 4,
        CustomAttributeData: { updatedField: 'newValue' },
        OriginalTimestamp: new Date(cause.ModifiedAtTimestamp).toISOString(),
      });

      const causes = await trpcClient.frontend.cause.getById.query({
        causeId: cause.Id,
      });
      expect(causes).toHaveLength(1);
      expect(causes[0]?.Title).toBe('Updated Cause Title');
      expect(causes[0]?.Description).toBe('Updated description');
    });

    it('should reject update with a stale OriginalTimestamp (optimistic concurrency)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const cause = await insertCause(
        buildCause({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
        })
      );
      if (!cause) {
        throw new Error('Failed to insert cause');
      }

      const originalTimestamp = new Date(
        cause.ModifiedAtTimestamp
      ).toISOString();

      // Perform a first update so the record's timestamp advances
      await trpcClient.frontend.cause.update.mutate({
        Id: cause.Id,
        ParentIssueId: parentIssue.Id!,
        Title: 'First Update',
        Description: 'First updated description',
        OriginalTimestamp: originalTimestamp,
      });

      // Attempt a second update using the original (now stale) timestamp
      await expect(
        trpcClient.frontend.cause.update.mutate({
          Id: cause.Id,
          ParentIssueId: parentIssue.Id!,
          Title: 'Stale Update',
          Description: 'Stale description',
          OriginalTimestamp: originalTimestamp,
        })
      ).rejects.toThrow();
    });

    it('should reject update with an empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const cause = await insertCause(
        buildCause({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
        })
      );
      if (!cause) {
        throw new Error('Failed to insert cause');
      }

      await expect(
        trpcClient.frontend.cause.update.mutate({
          Id: cause.Id,
          ParentIssueId: parentIssue.Id!,
          Title: '',
          Description: 'A description',
          OriginalTimestamp: new Date(cause.ModifiedAtTimestamp).toISOString(),
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single cause', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const insertResponse = await trpcClient.frontend.cause.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'Cause to delete',
        Description: 'This cause will be deleted',
      });

      expect(insertResponse.Id).toBeDefined();

      const deleteResponse = await trpcClient.frontend.cause.delete.mutate({
        Ids: [insertResponse.Id],
      });

      expect(deleteResponse).toEqual({ deletedCount: 1 });
    });

    it('should delete multiple causes at once', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const cause1 = await insertCause(
        buildCause({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
          overrides: { Title: 'Cause 1', Description: 'Description 1' },
        })
      );
      const cause2 = await insertCause(
        buildCause({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
          overrides: { Title: 'Cause 2', Description: 'Description 2' },
        })
      );

      if (!cause1 || !cause2) {
        throw new Error('Failed to insert causes');
      }

      const deleteResponse = await trpcClient.frontend.cause.delete.mutate({
        Ids: [cause1.Id, cause2.Id],
      });

      expect(deleteResponse).toEqual({ deletedCount: 2 });
    });

    it('should reject delete with an empty Ids array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ Ids: [] })
      ) as Parameters<typeof trpcClient.frontend.cause.delete.mutate>[0];

      await expect(
        trpcClient.frontend.cause.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });
  });
});
