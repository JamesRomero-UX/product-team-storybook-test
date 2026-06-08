import {
  buildObligation,
  buildObligationImpact,
  insertObligation,
  insertObligationImpact,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('obligation-impact', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('obligation impacts', () => {
    describe('get obligation impacts by parent id', () => {
      it('should return empty list when no obligation impacts exist', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response).toEqual([]);
      });

      it('should return all obligation impacts for the given obligation', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        // Create an obligation impact
        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
        });
        const insertedObligationImpact = await insertObligationImpact(
          obligationImpactInput
        );

        if (!insertedObligationImpact) {
          throw new Error('Failed to insert obligation impact');
        }

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response.length).toEqual(1);
        expect(response[0]).toEqual(
          expect.objectContaining({
            Id: insertedObligationImpact.Id,
            ParentObligationId: insertedObligation.Id,
            Description: obligationImpactInput.Description,
          })
        );
      });

      it('should return multiple obligation impacts for the same obligation', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        // Create multiple obligation impacts
        const impact1 = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
          overrides: { Description: 'Impact 1', ImpactRating: 2 },
        });
        const impact2 = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
          overrides: { Description: 'Impact 2', ImpactRating: 4 },
        });

        await insertObligationImpact(impact1);
        await insertObligationImpact(impact2);

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response.length).toEqual(2);
        expect(response.map((r) => r.Description)).toContain('Impact 1');
        expect(response.map((r) => r.Description)).toContain('Impact 2');
      });

      it('should not return obligation impacts for a different obligation', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create two obligations
        const obligation1Input = buildObligation({
          orgKey,
          userId,
          overrides: { Title: 'Obligation 1' },
        });
        const obligation2Input = buildObligation({
          orgKey,
          userId,
          overrides: { Title: 'Obligation 2' },
        });

        const insertedObligation1 = await insertObligation(obligation1Input);
        const insertedObligation2 = await insertObligation(obligation2Input);

        if (!insertedObligation1 || !insertedObligation2) {
          throw new Error('Failed to insert obligations');
        }

        // Create obligation impact for obligation 1 only
        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation1.Id,
        });
        await insertObligationImpact(obligationImpactInput);

        // Query impacts for obligation 2 - should be empty
        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation2.Id,
          });

        expect(response).toEqual([]);
      });

      it('should not return OrgKey field', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        // Create an obligation impact
        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
        });
        await insertObligationImpact(obligationImpactInput);

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response.length).toEqual(1);
        // OrgKey should be excluded based on the obligationImpact fragment
        expect(response[0]).not.toHaveProperty('OrgKey');
      });

      it('should return obligation impact with custom attribute data', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        const customData = { source: 'manual', verified: true };
        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
          overrides: {
            CustomAttributeData: customData,
          },
        });
        await insertObligationImpact(obligationImpactInput);

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response.length).toEqual(1);
        expect(response[0]?.CustomAttributeData).toEqual(customData);
      });

      it('should return obligation impacts with correct impact ratings', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
          overrides: {
            ImpactRating: 5,
            Description: 'High impact obligation',
          },
        });
        await insertObligationImpact(obligationImpactInput);

        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response.length).toEqual(1);
        expect(response[0]?.ImpactRating).toEqual(5);
        expect(response[0]?.Description).toEqual('High impact obligation');
      });
    });

    describe('insert obligation impact', () => {
      it('should insert a new obligation impact', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        const response =
          await trpcClient.frontend.obligationImpact.insert.mutate({
            ParentObligationId: insertedObligation.Id,
            Description: 'New obligation impact',
            ImpactRating: 3,
          });

        expect(response.Id).toBeDefined();
        expect(response.ParentObligationId).toEqual(insertedObligation.Id);
        expect(response.Description).toEqual('New obligation impact');
        expect(response.ImpactRating).toEqual(3);
        expect(response.CreatedByUser).toEqual(userId);
      });
    });

    describe('delete obligation impact', () => {
      it('should delete an existing obligation impact', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an obligation first
        const obligationInput = buildObligation({ orgKey, userId });
        const insertedObligation = await insertObligation(obligationInput);

        if (!insertedObligation) {
          throw new Error('Failed to insert obligation');
        }

        // Insert an obligation impact
        const obligationImpactInput = buildObligationImpact({
          orgKey,
          userId,
          parentObligationId: insertedObligation.Id,
        });

        const insertedObligationImpact = await insertObligationImpact(
          obligationImpactInput
        );

        if (!insertedObligationImpact) {
          throw new Error('Failed to insert obligation impact');
        }

        // Delete the obligation impact
        await trpcClient.frontend.obligationImpact.delete.mutate({
          ids: [insertedObligationImpact.Id],
        });

        // Verify deletion by attempting to fetch impacts for the obligation
        const response =
          await trpcClient.frontend.obligationImpact.getByParentId.query({
            parentId: insertedObligation.Id,
          });

        expect(response).toEqual([]);
      });
    });
  });
});
