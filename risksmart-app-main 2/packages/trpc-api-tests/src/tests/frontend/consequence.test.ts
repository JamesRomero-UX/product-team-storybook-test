import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import {
  buildConsequence,
  buildIssue,
  insertConsequence,
  insertIssue,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('consequence', () => {
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

      const consequenceId = randomUUID();
      const consequenceData = buildConsequence({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: consequenceId },
      });
      await insertConsequence(consequenceData);
      await insertConsequence(
        buildConsequence({ orgKey, userId, parentIssueId: issueId })
      );

      const response = await trpcClient.frontend.consequence.register.query();

      expect(response.consequence.length).toEqual(2);
      expect(response.consequence).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: consequenceId,
            Title: consequenceData.Title,
            Description: consequenceData.Description,
            CostType: consequenceData.CostType,
            ParentIssueId: issueId,
          }),
        ])
      );
    });

    it('should return empty array for new org', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.consequence.register.query();

      expect(response.consequence).toEqual([]);
    });
  });

  describe('getByParentIssueId', () => {
    it('should return consequences for an issue', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueId = randomUUID();
      await insertIssue(buildIssue(orgKey, userId, { Id: issueId }));

      const consequenceId = randomUUID();
      const consequenceData = buildConsequence({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: consequenceId },
      });
      await insertConsequence(consequenceData);
      await insertConsequence(
        buildConsequence({ orgKey, userId, parentIssueId: issueId })
      );

      const response =
        await trpcClient.frontend.consequence.getByParentIssueId.query({
          issueId,
        });

      expect(response.length).toEqual(2);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: consequenceId,
            Title: consequenceData.Title,
            ParentIssueId: issueId,
          }),
        ])
      );
    });

    it('should return empty for non-existent issue', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.consequence.getByParentIssueId.query({
          issueId: randomUUID(),
        });

      expect(response).toEqual([]);
    });
  });

  describe('consequenceById', () => {
    it('should return correct data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const issueId = randomUUID();
      await insertIssue(buildIssue(orgKey, userId, { Id: issueId }));

      const consequenceId = randomUUID();
      const consequenceData = buildConsequence({
        orgKey,
        userId,
        parentIssueId: issueId,
        overrides: { Id: consequenceId },
      });
      await insertConsequence(consequenceData);

      const response =
        await trpcClient.frontend.consequence.consequenceById.query({
          id: consequenceId,
        });

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: consequenceId,
          Title: consequenceData.Title,
          Description: consequenceData.Description,
          CostType: consequenceData.CostType,
          ParentIssueId: issueId,
        })
      );
    });

    it('should return empty for non-existent id', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.consequence.consequenceById.query({
          id: randomUUID(),
        });

      expect(response).toEqual([]);
    });
  });

  describe('insert', () => {
    it('should insert a consequence with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.consequence.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'Required fields only',
        CostType: CostType.Financial,
        CostValue: 500,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should insert a consequence with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.consequence.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'All optional fields',
        Description: 'A detailed description of the consequence',
        Criticality: 3,
        CostType: CostType.Financial,
        CostValue: 1000,
        Type: ConsequenceType.Financial,
        CustomAttributeData: { customField: 'value', count: 42 },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a consequence with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.consequence.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Title: 'Null optional fields',
        Description: null,
        Criticality: null,
        CostType: CostType.Financial,
        CostValue: 0,
        Type: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with an empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      await expect(
        trpcClient.frontend.consequence.insert.mutate({
          ParentIssueId: parentIssue.Id!,
          Title: '',
          CostType: CostType.Financial,
          CostValue: 100,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid UUID for ParentIssueId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.consequence.insert.mutate({
          ParentIssueId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Valid title',
          CostType: CostType.Financial,
          CostValue: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a consequence with new values', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const consequence = await insertConsequence(
        buildConsequence({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
        })
      );
      if (!consequence) {
        throw new Error('Failed to insert consequence');
      }

      await trpcClient.frontend.consequence.update.mutate({
        Id: consequence.Id,
        ParentIssueId: parentIssue.Id!,
        Title: 'Updated Consequence Title',
        Description: 'Updated description',
        Criticality: 4,
        CostType: CostType.Hours,
        CostValue: 200,
        Type: ConsequenceType.Operational,
        CustomAttributeData: { updatedField: 'newValue' },
        OriginalTimestamp: new Date(
          consequence.ModifiedAtTimestamp
        ).toISOString(),
      });

      const consequences =
        await trpcClient.frontend.consequence.consequenceById.query({
          id: consequence.Id,
        });
      expect(consequences).toHaveLength(1);
      expect(consequences[0]?.Title).toBe('Updated Consequence Title');
      expect(consequences[0]?.Description).toBe('Updated description');
    });

    it('should reject update with a stale OriginalTimestamp (optimistic concurrency)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const consequence = await insertConsequence(
        buildConsequence({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
        })
      );
      if (!consequence) {
        throw new Error('Failed to insert consequence');
      }

      const originalTimestamp = new Date(
        consequence.ModifiedAtTimestamp
      ).toISOString();

      // Perform a first update so the record's timestamp advances
      await trpcClient.frontend.consequence.update.mutate({
        Id: consequence.Id,
        ParentIssueId: parentIssue.Id!,
        Title: 'First Update',
        Description: 'First updated description',
        CostType: CostType.Financial,
        CostValue: 150,
        OriginalTimestamp: originalTimestamp,
      });

      // Attempt a second update using the original (now stale) timestamp
      await expect(
        trpcClient.frontend.consequence.update.mutate({
          Id: consequence.Id,
          ParentIssueId: parentIssue.Id!,
          Title: 'Stale Update',
          Description: 'Stale description',
          CostType: CostType.Financial,
          CostValue: 150,
          OriginalTimestamp: originalTimestamp,
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single consequence', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const insertResponse =
        await trpcClient.frontend.consequence.insert.mutate({
          ParentIssueId: parentIssue.Id!,
          Title: 'Consequence to delete',
          CostType: CostType.Financial,
          CostValue: 100,
        });

      expect(insertResponse.Id).toBeDefined();

      const deleteResponse =
        await trpcClient.frontend.consequence.delete.mutate({
          Ids: [insertResponse.Id],
        });

      expect(deleteResponse).toEqual({ deletedCount: 1 });
    });

    it('should delete multiple consequences at once', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const consequence1 = await insertConsequence(
        buildConsequence({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
          overrides: { Title: 'Consequence 1' },
        })
      );
      const consequence2 = await insertConsequence(
        buildConsequence({
          orgKey,
          userId,
          parentIssueId: parentIssue.Id!,
          overrides: { Title: 'Consequence 2' },
        })
      );

      if (!consequence1 || !consequence2) {
        throw new Error('Failed to insert consequences');
      }

      const deleteResponse =
        await trpcClient.frontend.consequence.delete.mutate({
          Ids: [consequence1.Id, consequence2.Id],
        });

      expect(deleteResponse).toEqual({ deletedCount: 2 });
    });

    it('should reject delete with an empty Ids array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ Ids: [] })
      ) as Parameters<typeof trpcClient.frontend.consequence.delete.mutate>[0];

      await expect(
        trpcClient.frontend.consequence.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });
  });
});
