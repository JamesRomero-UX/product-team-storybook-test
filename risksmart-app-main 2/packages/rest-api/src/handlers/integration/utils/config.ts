import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getLogger } from 'src/logger';

const logger = getLogger();

interface JiraConfig {
  JiraBaseUrl: string;
  JiraApiToken: string;
}

/**
 * Retrieves the Jira configuration from AWS Secrets Manager.
 * @param secretId - The ID of the secret containing the Jira configuration.
 * @returns A promise that resolves to the Jira configuration object.
 */
export const getConfig = async (secretId: string): Promise<JiraConfig> => {
  try {
    logger.info('Retrieving Jira API connection secret', {
      secretId,
    });
    const secretManagerClient = new SecretsManagerClient();
    const secrets = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    return JSON.parse(secrets.SecretString!);
  } catch (e) {
    logger.error('Failed to parse secret', e as Error);
    throw e;
  }
};
