#!/usr/bin/env -S pnpm exec tsx

/* eslint-disable no-console */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

interface TenantRecord {
  pk: string;
  sk: string;
  name: string;
  region: string;
}

interface ScriptOptions {
  tableName: string;
  version: string;
  awsRegion: string;
  deploymentRegions: string[];
}

/**
 * Query DynamoDB table to get all tenant records for a specific region using GSI
 */
async function queryTenantRecords(
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantRegion: string
): Promise<TenantRecord[]> {
  const tenants: TenantRecord[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  try {
    do {
      const response = await client.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk',
          ExpressionAttributeValues: {
            ':gsi1pk': `REGION/${tenantRegion}`,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      if (response.Items) {
        for (const item of response.Items) {
          if (item.pk && item.sk && item.tenant && item.region) {
            tenants.push({
              pk: item.pk as string,
              sk: item.sk as string,
              name: item.tenant as string,
              region: item.region as string,
            });
          }
        }
      }

      lastEvaluatedKey = response.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (lastEvaluatedKey);

    console.log(
      `Found ${tenants.length} tenant records in DynamoDB table for region ${tenantRegion}`
    );

    return tenants;
  } catch (error) {
    console.error(`Error querying DynamoDB table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Create DynamoDB client
 */
function createDynamoClient(awsRegion: string): DynamoDBDocumentClient {
  const client = new DynamoDBClient({
    region: awsRegion,
  });

  return DynamoDBDocumentClient.from(client);
}

/**
 * Process single tenant record by creating or updating it.
 */
async function processTenant(
  client: DynamoDBDocumentClient,
  tableName: string,
  tenant: TenantRecord,
  version: string
): Promise<void> {
  console.log(`Processing tenant: ${tenant.name}`);

  try {
    await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: tenant.pk,
          sk: tenant.sk,
        },
        UpdateExpression:
          'SET #version = :version, #tenant = if_not_exists(#tenant, :tenant), #region = if_not_exists(#region, :region) REMOVE #state',
        ExpressionAttributeNames: {
          '#version': 'version',
          '#tenant': 'tenant',
          '#region': 'region',
          '#state': 'state',
        },
        ExpressionAttributeValues: {
          ':version': version,
          ':tenant': tenant.name,
          ':region': tenant.region,
        },
      })
    );
    console.log(`✓ Processed tenant: ${tenant.name}`);
  } catch (error) {
    console.error(`Failed to process tenant ${tenant.name}:`, error);
    throw error;
  }
}
/**
 * Main function to update tenant table
 */
async function updateTenantTable(options: ScriptOptions): Promise<void> {
  const { tableName, version, awsRegion, deploymentRegions } = options;

  console.log('Starting tenant table update...');
  console.log(`Table Name: ${tableName}`);
  console.log(`Version: ${version}`);
  console.log(`AWS Region: ${awsRegion}`);
  console.log(`Deployment Regions: ${deploymentRegions.join(', ')}`);
  console.log('---');

  // Create DynamoDB client
  const dynamoClient = createDynamoClient(awsRegion);

  // Query for all tenant records across all specified deployment regions
  const tenants: TenantRecord[] = [];
  for (const region of deploymentRegions) {
    const regionTenants = await queryTenantRecords(
      dynamoClient,
      tableName,
      region
    );
    tenants.push(...regionTenants);
  }

  if (tenants.length === 0) {
    console.log('No tenant records found in DynamoDB table');

    return;
  }

  // Process each tenant
  let successCount = 0;
  let errorCount = 0;

  for (const tenant of tenants) {
    try {
      await processTenant(dynamoClient, tableName, tenant, version);
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`Failed to process tenant ${tenant.name}:`, error);
    }
  }

  console.log('---');
  console.log(
    `Update completed. Success: ${successCount}, Errors: ${errorCount}`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

function main(): void {
  // Validate required parameters
  const requiredEnvVars = [
    'DYNAMODB_TABLE_NAME',
    'VERSION',
    'AWS_REGION',
    'DEPLOYMENT_REGIONS',
  ];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.error(`Error: ${varName} environment variable is required`);
      process.exit(1);
    }
  }

  // Environment variables
  const tableName = process.env.DYNAMODB_TABLE_NAME!;
  const version = process.env.VERSION!;
  const awsRegion = process.env.AWS_REGION!;
  const deploymentRegions = JSON.parse(
    process.env.DEPLOYMENT_REGIONS!
  ) as string[];

  const options: ScriptOptions = {
    tableName,
    version,
    awsRegion,
    deploymentRegions,
  };

  updateTenantTable(options).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { TenantRecord, updateTenantTable };
