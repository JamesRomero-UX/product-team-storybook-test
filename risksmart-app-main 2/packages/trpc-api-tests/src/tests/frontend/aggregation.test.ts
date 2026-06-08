import {
  buildAggregationOrg,
  insertAggregationOrg,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('aggregation', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getAggregationSettingsForOrg', () => {
    it('should return empty array when no aggregation settings exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.aggregation.getAggregationSettingsForOrg.query();

      expect(response).toEqual([]);
    });

    it('should return aggregation settings for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildAggregationOrg({ orgKey, userId });
      await insertAggregationOrg(input);

      const response =
        await trpcClient.frontend.aggregation.getAggregationSettingsForOrg.query();

      expect(response).toHaveLength(1);
    });

    it('should return expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildAggregationOrg({
        orgKey,
        userId,
        overrides: { Config: { key: 'value' } },
      });
      await insertAggregationOrg(input);

      const response =
        await trpcClient.frontend.aggregation.getAggregationSettingsForOrg.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          RiskScoringModel: null,
          Appetite: null,
          Config: { key: 'value' },
        })
      );
    });

    it('should not return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildAggregationOrg({ orgKey, userId });
      await insertAggregationOrg(input);

      const response =
        await trpcClient.frontend.aggregation.getAggregationSettingsForOrg.query();

      expect(response).toHaveLength(1);
      expect(response[0]).not.toHaveProperty('OrgKey');
    });
  });
});
