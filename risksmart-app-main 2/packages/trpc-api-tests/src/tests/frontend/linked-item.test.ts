import {
  buildLinkedItem,
  buildRisk,
  insertLinkedItem,
  insertRisk,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('linked-item', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('linkedItemRisks', () => {
    it('should return empty array when no linked risks exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a source item (another risk) to query linked items from
      const sourceRiskInput = buildRisk({ orgKey, userId });
      const insertedSourceRisk = await insertRisk(sourceRiskInput);

      if (!insertedSourceRisk) {
        throw new Error('Failed to insert source risk');
      }

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk.Id,
        });

      expect(response).toEqual([]);
    });

    it('should return linked risks for a given source', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a source risk (the item we're querying from)
      const sourceRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Source Risk',
        },
      });
      const insertedSourceRisk = await insertRisk(sourceRiskInput);

      if (!insertedSourceRisk) {
        throw new Error('Failed to insert source risk');
      }

      // Create a target risk (the linked item)
      const targetRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Linked Target Risk',
          Description: 'Target risk description',
        },
      });
      const insertedTargetRisk = await insertRisk(targetRiskInput);

      if (!insertedTargetRisk) {
        throw new Error('Failed to insert target risk');
      }

      // Create the linked item relationship
      const linkedItemInput = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk.Id,
        targetId: insertedTargetRisk.Id,
      });
      await insertLinkedItem(linkedItemInput);

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk.Id,
        });

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: linkedItemInput.Id,
          Source: insertedSourceRisk.Id,
          Target: insertedTargetRisk.Id,
        })
      );
      expect(response[0]?.target_risk).toEqual(
        expect.objectContaining({
          Id: insertedTargetRisk.Id,
          Title: targetRiskInput.Title,
          Description: targetRiskInput.Description,
        })
      );
    });

    it('should return multiple linked risks', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a source risk
      const sourceRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Source Risk with Multiple Links',
        },
      });
      const insertedSourceRisk = await insertRisk(sourceRiskInput);

      if (!insertedSourceRisk) {
        throw new Error('Failed to insert source risk');
      }

      // Create first target risk
      const targetRisk1Input = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'First Linked Risk',
        },
      });
      const insertedTargetRisk1 = await insertRisk(targetRisk1Input);

      if (!insertedTargetRisk1) {
        throw new Error('Failed to insert first target risk');
      }

      // Create second target risk
      const targetRisk2Input = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Second Linked Risk',
        },
      });
      const insertedTargetRisk2 = await insertRisk(targetRisk2Input);

      if (!insertedTargetRisk2) {
        throw new Error('Failed to insert second target risk');
      }

      // Create linked items for both target risks
      const linkedItem1Input = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk.Id,
        targetId: insertedTargetRisk1.Id,
      });
      await insertLinkedItem(linkedItem1Input);

      const linkedItem2Input = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk.Id,
        targetId: insertedTargetRisk2.Id,
      });
      await insertLinkedItem(linkedItem2Input);

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk.Id,
        });

      expect(response.length).toEqual(2);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: linkedItem1Input.Id,
            Target: insertedTargetRisk1.Id,
          }),
          expect.objectContaining({
            Id: linkedItem2Input.Id,
            Target: insertedTargetRisk2.Id,
          }),
        ])
      );
    });

    it('should not return linked items that target non-risk types', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a source risk
      const sourceRiskInput = buildRisk({ orgKey, userId });
      const insertedSourceRisk = await insertRisk(sourceRiskInput);

      if (!insertedSourceRisk) {
        throw new Error('Failed to insert source risk');
      }

      // Create a target risk (should be returned)
      const targetRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Valid Target Risk',
        },
      });
      const insertedTargetRisk = await insertRisk(targetRiskInput);

      if (!insertedTargetRisk) {
        throw new Error('Failed to insert target risk');
      }

      // Create linked item to risk (should be returned)
      const linkedItemToRisk = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk.Id,
        targetId: insertedTargetRisk.Id,
      });
      await insertLinkedItem(linkedItemToRisk);

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk.Id,
        });

      // Should only return the linked risk, not any non-risk linked items
      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: linkedItemToRisk.Id,
          Target: insertedTargetRisk.Id,
        })
      );
    });

    it('should return linked risk with correct tier information', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a source risk
      const sourceRiskInput = buildRisk({ orgKey, userId });
      const insertedSourceRisk = await insertRisk(sourceRiskInput);

      if (!insertedSourceRisk) {
        throw new Error('Failed to insert source risk');
      }

      // Create a target risk with specific tier
      const targetRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Tier 2 Target Risk',
          Tier: 2,
        },
      });
      const insertedTargetRisk = await insertRisk(targetRiskInput);

      if (!insertedTargetRisk) {
        throw new Error('Failed to insert target risk');
      }

      // Create linked item
      const linkedItemInput = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk.Id,
        targetId: insertedTargetRisk.Id,
      });
      await insertLinkedItem(linkedItemInput);

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk.Id,
        });

      expect(response.length).toEqual(1);
      expect(response[0]?.target_risk).toEqual(
        expect.objectContaining({
          Id: insertedTargetRisk.Id,
          Tier: 2,
        })
      );
    });

    it('should not return linked items from a different source', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create first source risk
      const sourceRisk1Input = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'First Source Risk',
        },
      });
      const insertedSourceRisk1 = await insertRisk(sourceRisk1Input);

      if (!insertedSourceRisk1) {
        throw new Error('Failed to insert first source risk');
      }

      // Create second source risk
      const sourceRisk2Input = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Second Source Risk',
        },
      });
      const insertedSourceRisk2 = await insertRisk(sourceRisk2Input);

      if (!insertedSourceRisk2) {
        throw new Error('Failed to insert second source risk');
      }

      // Create target risk
      const targetRiskInput = buildRisk({
        orgKey,
        userId,
        overrides: {
          Title: 'Target Risk',
        },
      });
      const insertedTargetRisk = await insertRisk(targetRiskInput);

      if (!insertedTargetRisk) {
        throw new Error('Failed to insert target risk');
      }

      // Link target risk to second source only
      const linkedItemInput = buildLinkedItem({
        orgKey,
        userId,
        sourceId: insertedSourceRisk2.Id,
        targetId: insertedTargetRisk.Id,
      });
      await insertLinkedItem(linkedItemInput);

      // Query linked items for first source - should return empty
      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: insertedSourceRisk1.Id,
        });

      expect(response).toEqual([]);
    });

    it('should return non-existent id as empty array', async () => {
      const { trpcClient } = context;
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response =
        await trpcClient.frontend.linkedItem.linkedItemRisks.query({
          id: nonExistentId,
        });

      expect(response).toEqual([]);
    });
  });
});
