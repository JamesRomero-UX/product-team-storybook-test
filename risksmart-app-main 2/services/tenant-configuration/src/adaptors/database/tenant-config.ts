import type {
  AttributeValue,
  GetItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

import type { OrganisationConfig, TenantConfig } from '../../domain/types';
import { getEnv } from '../../environment';
import { getLogger } from '../../logger';

const logger = getLogger();
logger.info('Initializing DynamoDB client for Tenant Configuration', {
  region: getEnv('AWS_REGION'),
});
// AWS SDK v3 automatically picks up AWS_ENDPOINT_URL_DYNAMODB from the
// environment to redirect requests to a local mock when running locally.
const dynamoDB = new DynamoDBClient({});

const mapDynamoItemToTenantConfig = (
  item: Record<string, AttributeValue>,
  tenantContext?: string
): TenantConfig => {
  if (!item.tenant?.S || !item.region?.S || !item.databases?.L) {
    throw new Error(
      `Invalid tenant configuration${tenantContext ? ` for tenant: ${tenantContext}` : ''}`
    );
  }

  return {
    tenant: item.tenant.S,
    region: item.region.S,
    databases: item.databases.L.map((db) => {
      const dbMap = db.M;
      if (!dbMap?.secretArn?.S || !dbMap?.type?.S) {
        throw new Error(
          `Invalid database configuration${tenantContext ? ` for tenant: ${tenantContext}` : ''}`
        );
      }

      const type = dbMap.type.S;
      if (type !== 'reader' && type !== 'writer') {
        throw new Error(`Invalid database type: ${type}`);
      }

      return { secretArn: dbMap.secretArn.S, type };
    }),
  };
};

const mapDynamoItemToOrganisationConfig = (
  item: Record<string, AttributeValue>,
  tenantContext?: string
): OrganisationConfig => {
  if (!item.orgKey?.S || !item.organisation?.S) {
    throw new Error(
      `Invalid organisation configuration${tenantContext ? ` for organisation: ${tenantContext}` : ''}`
    );
  }

  return {
    orgKey: item.orgKey.S,
    organisation: item.organisation.S,
  };
};

export const getTenantConfigFromDynamoDB = async (
  tenant: string,
  region: string
): Promise<TenantConfig> => {
  const lowercaseTenant = tenant.toLowerCase();
  logger.info('Retrieving tenant configuration from DynamoDB', {
    tenant: lowercaseTenant,
    region: region,
  });
  // Key structure: pk = TENANT/tenant name, sk = "REGION/region" (allows same tenant in multiple regions)
  const params: GetItemCommandInput = {
    TableName: getEnv('TENANT_CONFIG_TABLE'),
    Key: {
      pk: { S: `TENANT/${lowercaseTenant}` },
      sk: { S: `REGION/${region}` },
    },
  };

  try {
    const command = new GetItemCommand(params);
    const response = await dynamoDB.send(command);

    if (!response?.Item) {
      throw new Error(`Configuration not found for tenant: ${lowercaseTenant}`);
    }

    logger.info('Parsing dynamoDB response');

    return mapDynamoItemToTenantConfig(response.Item, lowercaseTenant);
  } catch (error) {
    logger.error('Error retrieving tenant configuration from DynamoDB', {
      error,
      tenant: lowercaseTenant,
    });
    throw error;
  }
};

export const getAllTenantConfigs = async (
  region: string
): Promise<TenantConfig[]> => {
  try {
    const allItems: Record<string, AttributeValue>[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      // Use GSI1: GSI1PK = "REGION/region" returns all tenants in that region
      // GSI1SK = TENANT/tenantName
      const command = new QueryCommand({
        TableName: getEnv('TENANT_CONFIG_TABLE'),
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeNames: {
          '#databases': 'databases',
        },
        ExpressionAttributeValues: {
          ':gsi1pk': { S: `REGION/${region}` },
          ':minSize': { N: '1' },
        },
        FilterExpression: 'size(#databases) >= :minSize',
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      });

      const response = await dynamoDB.send(command);

      if (response.Items) {
        allItems.push(...response.Items);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return allItems.map((item) => mapDynamoItemToTenantConfig(item));
  } catch (error) {
    logger.error('Error retrieving tenant configurations from DynamoDB', {
      error,
    });
    throw error;
  }
};

export const getAllOrganisationsForTenant = async (
  region: string,
  tenant: string
): Promise<OrganisationConfig[]> => {
  try {
    const allItems: Record<string, AttributeValue>[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;
    const lowercaseTenant = tenant.toLowerCase();

    do {
      // Use GSI1: GSI1PK = "REGION/region/ORG" returns all orgs in that region
      // GSI1SK = TENANT/tenantName (Tenant sk identifies these as org records for that tenant)
      const command = new QueryCommand({
        TableName: getEnv('TENANT_CONFIG_TABLE'),
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
        ExpressionAttributeValues: {
          ':gsi1pk': { S: `REGION/${region}/ORG` },
          ':gsi1sk': { S: `TENANT/${lowercaseTenant}` },
        },
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      });

      const response = await dynamoDB.send(command);

      if (response.Items) {
        allItems.push(...response.Items);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return allItems.map((item) => mapDynamoItemToOrganisationConfig(item));
  } catch (error) {
    logger.error('Error retrieving organisation configurations from DynamoDB', {
      error,
    });
    throw error;
  }
};

/**
 * Get the tenant that an organisation belongs to.
 * pk = orgKey,
 */
export const getTenantForOrganisation = async (
  orgKey: string,
  region: string
): Promise<{ tenant: string; region: string } | null> => {
  try {
    // Use GSI1 for direct org lookup: GSI1PK = orgKey, GSI1SK begins with "REGION/region/"
    const command = new QueryCommand({
      TableName: getEnv('TENANT_CONFIG_TABLE'),
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `ORG/${orgKey}` },
        ':skPrefix': { S: `REGION/${region}/` },
      },
      Limit: 1,
    });

    const response = await dynamoDB.send(command);

    if (!response.Items || response.Items.length === 0 || !response.Items[0]) {
      logger.warn('Organisation not found in DynamoDB', { orgKey });

      return null;
    }

    const item = response.Items[0];

    if (!item.tenant?.S || !item.region?.S) {
      throw new Error(`Invalid organisation record for orgKey: ${orgKey}`);
    }

    return {
      tenant: item.tenant.S,
      region: item.region.S,
    };
  } catch (error) {
    logger.error('Error retrieving tenant for organisation from DynamoDB', {
      error,
      orgKey,
    });
    throw error;
  }
};

export const getAllOrganisationsForRegion = async (
  region: string
): Promise<OrganisationConfig[]> => {
  try {
    const allItems: Record<string, AttributeValue>[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      // Use GSI1: GSI1PK = "REGION/region/ORG" returns all orgs in that region
      const command = new QueryCommand({
        TableName: getEnv('TENANT_CONFIG_TABLE'),
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: {
          ':gsi1pk': { S: `REGION/${region}/ORG` },
        },
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
      });

      const response = await dynamoDB.send(command);

      if (response.Items) {
        allItems.push(...response.Items);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return allItems.map((item) => mapDynamoItemToOrganisationConfig(item));
  } catch (error) {
    logger.error('Error retrieving organisation configurations from DynamoDB', {
      error,
    });
    throw error;
  }
};
