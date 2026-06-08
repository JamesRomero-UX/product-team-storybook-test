import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getLogger } from 'src/logger';
import { z } from 'zod';

const logger = getLogger();

const secretSchema = z.object({
  apiKey: z.string().min(1),
});

export type IngestionSecret = z.infer<typeof secretSchema>;

export const createSecretsManagerAdaptor = () => ({
  getIngestionSecret: async (secretArn: string): Promise<IngestionSecret> => {
    // If running locally with INGESTION_API_KEY set, skip Secrets Manager
    const localApiKey = process.env.INGESTION_API_KEY;
    if (process.env.IS_LOCAL === 'true' && localApiKey) {
      logger.info('Using INGESTION_API_KEY from environment (local mode)');

      return secretSchema.parse({ apiKey: localApiKey });
    }

    logger.info('Fetching ingestion secret from Secrets Manager', {
      secretArn,
    });

    const client = new SecretsManagerClient({});
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    if (!response.SecretString) {
      throw new Error(`Secret has no value: ${secretArn}`);
    }

    return secretSchema.parse(JSON.parse(response.SecretString));
  },
});
