import {
  buildBusinessArea,
  insertBusinessArea,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('business-area', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('businessAreas', () => {
    it('should return empty array when no business areas exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toEqual([]);
    });

    it('should return business areas for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const businessAreaInput = buildBusinessArea(orgKey, userId);
      await insertBusinessArea(businessAreaInput);

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toHaveLength(1);
    });

    it('should return business area with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const businessAreaInput = buildBusinessArea(orgKey, userId, {
        Title: 'Risk Management',
      });
      const inserted = await insertBusinessArea(businessAreaInput);

      if (!inserted) {
        throw new Error('Failed to insert business area');
      }

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: inserted.Id,
          Title: 'Risk Management',
          SequentialId: inserted.SequentialId,
        })
      );
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const businessAreaInput = buildBusinessArea(orgKey, userId);
      await insertBusinessArea(businessAreaInput);

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('createdByUser');
      expect(response[0]).toHaveProperty('modifiedByUser');
    });

    it('should return multiple business areas sorted by title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ba1 = buildBusinessArea(orgKey, userId, {
        Title: 'Zulu Department',
      });
      const ba2 = buildBusinessArea(orgKey, userId, {
        Title: 'Alpha Department',
      });

      await insertBusinessArea(ba1);
      await insertBusinessArea(ba2);

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toHaveLength(2);
      expect(response[0]?.Title).toBe('Alpha Department');
      expect(response[1]?.Title).toBe('Zulu Department');
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const businessAreaInput = buildBusinessArea(orgKey, userId);
      await insertBusinessArea(businessAreaInput);

      const response =
        await trpcClient.frontend.businessArea.businessAreas.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });
  });
});
