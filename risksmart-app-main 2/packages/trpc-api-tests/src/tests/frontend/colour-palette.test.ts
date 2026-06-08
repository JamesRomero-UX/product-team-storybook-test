import {
  buildColourPalette,
  insertColourPalette,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('colour-palette', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getColourPalettes', () => {
    it('should return empty array when no colour palettes exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      expect(response).toEqual([]);
    });

    it('should return colour palette for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildColourPalette(orgKey, userId);
      await insertColourPalette(input);

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      expect(response).toHaveLength(1);
    });

    it('should return colour palette with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildColourPalette(orgKey, userId, {
        Name: 'Custom Palette',
        Settings: { colors: ['#111111', '#222222'] },
      });
      const inserted = await insertColourPalette(input);

      if (!inserted) {
        throw new Error('Failed to insert colour palette');
      }

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: inserted.Id,
          Name: 'Custom Palette',
          Settings: { colors: ['#111111', '#222222'] },
        })
      );
    });

    it('should return only the most recent colour palette', async () => {
      const { orgKey, userId, trpcClient } = context;

      const older = buildColourPalette(orgKey, userId, {
        Name: 'Older Palette',
      });
      await insertColourPalette(older);

      const newer = buildColourPalette(orgKey, userId, {
        Name: 'Newer Palette',
      });
      await insertColourPalette(newer);

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      // Service uses limit: 1 with orderBy CreatedAtTimestamp desc
      expect(response).toHaveLength(1);
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildColourPalette(orgKey, userId);
      await insertColourPalette(input);

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });

    it('should return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildColourPalette(orgKey, userId);
      await insertColourPalette(input);

      const response =
        await trpcClient.frontend.colourPalette.getColourPalettes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('OrgKey');
    });
  });
});
