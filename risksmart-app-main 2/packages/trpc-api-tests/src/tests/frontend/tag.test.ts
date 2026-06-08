import { buildTagType, insertTagType } from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('tag', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('allTypes', () => {
    it('should return empty array when no tag types exist', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toEqual([]);
    });

    it('should return tag types for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagTypeInput = buildTagType(orgKey, userId);
      await insertTagType(tagTypeInput);

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(1);
    });

    it('should return tag type with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagTypeInput = buildTagType(orgKey, userId, {
        Name: 'Risk Category',
        Description: 'Categorises risks by type',
      });
      const inserted = await insertTagType(tagTypeInput);

      if (!inserted) {
        throw new Error('Failed to insert tag type');
      }

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          TagTypeId: inserted.TagTypeId,
          Name: 'Risk Category',
          Description: 'Categorises risks by type',
        })
      );
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagTypeInput = buildTagType(orgKey, userId);
      await insertTagType(tagTypeInput);

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('createdByUser');
      expect(response[0]).toHaveProperty('modifiedByUser');
    });

    it('should return multiple tag types', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType1 = buildTagType(orgKey, userId, { Name: 'Tag A' });
      const tagType2 = buildTagType(orgKey, userId, { Name: 'Tag B' });

      await insertTagType(tagType1);
      await insertTagType(tagType2);

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(2);
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagTypeInput = buildTagType(orgKey, userId);
      await insertTagType(tagTypeInput);

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });

    it('should return tag type with null description', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagTypeInput = buildTagType(orgKey, userId, {
        Description: null,
      });
      await insertTagType(tagTypeInput);

      const response = await trpcClient.frontend.tag.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.Description).toBeNull();
    });
  });
});
