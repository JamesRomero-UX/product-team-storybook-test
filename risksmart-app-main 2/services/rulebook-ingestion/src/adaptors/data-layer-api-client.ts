import { getLogger } from 'src/logger';
import { z } from 'zod';

import { signRequest } from './sign-request';

const logger = getLogger();

export interface DataLayerApiClientConfig {
  baseUrl: string;
  signRequests: boolean;
}

interface IngestionConfigRow {
  Id: string;
  IngestionConfig: unknown;
  SecretArn: string | null;
  Enabled: boolean;
}

const ingestionConfigJsonSchema = z.object({
  baseUrl: z.string().url(),
  profileId: z.string().min(1),
});

export interface IngestionConfig {
  secretArn: string;
  baseUrl: string;
  profileId: string;
}

/**
 * Lightweight HTTP client for fetching ingestion config from the data-layer internal API.
 * Follows the permissions service DataLayerApiClient pattern.
 */
export const createDataLayerApiClient = (config: DataLayerApiClientConfig) => {
  const baseUrl = config.baseUrl.replace(/\/$/, '');

  const getRequestHeaders = async (
    url: string,
    method: string,
    baseHeaders: Record<string, string>
  ): Promise<Record<string, string>> => {
    if (!config.signRequests) {
      return baseHeaders;
    }

    return signRequest(url, method, baseHeaders);
  };

  const getIngestionConfig = async (
    tenant: string,
    orgKey: string
  ): Promise<IngestionConfig | null> => {
    const url = `${baseUrl}/ingestion-configs`;

    const baseHeaders: Record<string, string> = {
      'x-tenant': tenant,
      'x-org-key': orgKey,
      'x-user-id': 'SYSTEM',
      'Content-Type': 'application/json',
    };

    logger.info('Fetching ingestion configs from data-layer', {
      tenant,
      orgKey,
    });

    const headers = await getRequestHeaders(url, 'GET', baseHeaders);
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to fetch ingestion configs: ${response.status} ${body}`
      );
    }

    // response.json() returns unknown; shape is dictated by the data-layer API contract for this endpoint.
    const result = (await response.json()) as { data: IngestionConfigRow[] };
    const row = result.data[0];

    if (!row) {
      return null;
    }

    if (!row.SecretArn) {
      throw new Error(
        `No SecretArn on ingestion config for org ${orgKey} in tenant ${tenant}`
      );
    }

    if (!row.IngestionConfig) {
      throw new Error(
        `No IngestionConfig JSON on ingestion config for org ${orgKey} in tenant ${tenant}`
      );
    }

    const providerConfig = ingestionConfigJsonSchema.parse(row.IngestionConfig);

    return {
      secretArn: row.SecretArn,
      baseUrl: providerConfig.baseUrl,
      profileId: providerConfig.profileId,
    };
  };

  return { getIngestionConfig };
};
