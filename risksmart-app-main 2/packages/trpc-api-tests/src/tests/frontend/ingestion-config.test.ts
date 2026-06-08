import {
  buildIngestionConfig,
  insertIngestionConfig,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('ingestion-config', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getAll', () => {
    it('should return empty array when no ingestion configs exist', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response).toEqual([]);
    });

    it('should return ingestion configs for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
    });

    it('should return ingestion config with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
      });
      const insertedConfig = await insertIngestionConfig(ingestionConfigInput);

      if (!insertedConfig) {
        throw new Error('Failed to insert ingestion config');
      }

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedConfig.Id,
          IngestionConfig: ingestionConfigInput.IngestionConfig,
          SecretArn: ingestionConfigInput.SecretArn,
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should not return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]).not.toHaveProperty('OrgKey');
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });

    it('should return multiple ingestion configs', async () => {
      const { orgKey, userId, trpcClient } = context;

      const config1 = buildIngestionConfig({
        orgKey,
        userId,
        overrides: {
          IngestionConfig: { source: 'csv', enabled: true },
        },
      });
      const config2 = buildIngestionConfig({
        orgKey,
        userId,
        overrides: {
          IngestionConfig: { source: 'api', enabled: false },
        },
      });

      await insertIngestionConfig(config1);
      await insertIngestionConfig(config2);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(2);
    });

    it('should return ingestion config with custom IngestionConfig data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const customConfig = { source: 'sftp', host: 'example.com', port: 22 };
      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
        overrides: {
          IngestionConfig: customConfig,
        },
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.IngestionConfig).toEqual(customConfig);
    });

    it('should return ingestion config with null IngestionConfig', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
        overrides: {
          IngestionConfig: null,
        },
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.IngestionConfig).toBeNull();
    });

    it('should return ingestion config with SecretArn', async () => {
      const { orgKey, userId, trpcClient } = context;

      const ingestionConfigInput = buildIngestionConfig({
        orgKey,
        userId,
        overrides: {
          SecretArn: 'arn:aws:secretsmanager:us-east-1:123456789:secret:test',
        },
      });
      await insertIngestionConfig(ingestionConfigInput);

      const response = await trpcClient.frontend.ingestionConfig.getAll.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.SecretArn).toEqual(
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test'
      );
    });
  });
});
