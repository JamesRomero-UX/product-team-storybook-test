/**
 * Integration tests for tenant-config.ts DynamoDB queries
 *
 * These tests verify the query patterns work correctly against a real DynamoDB Local instance.
 * Requires DynamoDB Local running (started via docker-compose).
 * Run: pnpm exec vitest --run src/adaptors/database/tenant-config.integration.test.ts
 *
 */
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Set env vars before importing tenant-config (it reads them at module load time)
const TEST_TABLE_NAME = 'TenantConfig';
const DYNAMODB_ENDPOINT =
  process.env.AWS_ENDPOINT_URL_DYNAMODB || 'http://localhost:8000';
const AWS_REGION = process.env.AWS_REGION || 'eu-west-2';
process.env.AWS_REGION ??= AWS_REGION;
// AWS SDK v3 picks up this env var to redirect DynamoDB requests to local mock
process.env.AWS_ENDPOINT_URL_DYNAMODB ??= DYNAMODB_ENDPOINT;
process.env.TENANT_CONFIG_TABLE ??= TEST_TABLE_NAME;

import {
  getAllOrganisationsForRegion,
  getAllOrganisationsForTenant,
  getAllTenantConfigs,
  getTenantConfigFromDynamoDB,
  getTenantForOrganisation,
} from './tenant-config';

// Test data matching the single GSI pattern with object type in SK
const TEST_DATA = {
  tenants: [
    {
      pk: 'TENANT/acme',
      sk: 'REGION/eu-west-2',
      GSI1PK: 'REGION/eu-west-2',
      GSI1SK: 'TENANT/acme',
      tenant: 'acme',
      region: 'eu-west-2',
      databases: [
        {
          secretArn:
            'arn:aws:secretsmanager:eu-west-2:123456789:secret:acme-writer',
          type: 'writer',
        },
        {
          secretArn:
            'arn:aws:secretsmanager:eu-west-2:123456789:secret:acme-reader',
          type: 'reader',
        },
      ],
    },
    {
      pk: 'TENANT/globex',
      sk: 'REGION/eu-west-2',
      GSI1PK: 'REGION/eu-west-2',
      GSI1SK: 'TENANT/globex',
      tenant: 'globex',
      region: 'eu-west-2',
      databases: [
        {
          secretArn:
            'arn:aws:secretsmanager:eu-west-2:123456789:secret:globex-writer',
          type: 'writer',
        },
      ],
    },
    {
      pk: 'TENANT/globex',
      sk: 'REGION/us-east-1',
      GSI1PK: 'REGION/us-east-1',
      GSI1SK: 'TENANT/globex',
      tenant: 'globex',
      region: 'us-east-1',
      databases: [
        {
          secretArn:
            'arn:aws:secretsmanager:us-east-1:123456789:secret:globex-writer',
          type: 'writer',
        },
      ],
    },
    {
      pk: 'TENANT/initech',
      sk: 'REGION/us-east-1',
      GSI1PK: 'REGION/us-east-1',
      GSI1SK: 'TENANT/initech',
      tenant: 'initech',
      region: 'us-east-1',
      databases: [
        {
          secretArn:
            'arn:aws:secretsmanager:us-east-1:123456789:secret:initech-writer',
          type: 'writer',
        },
      ],
    },
  ],
  organisations: [
    {
      pk: 'ORG/org_acme_hq',
      sk: 'REGION/eu-west-2/TENANT/acme',
      GSI1PK: 'REGION/eu-west-2/ORG',
      GSI1SK: 'TENANT/acme',
      orgKey: 'org_acme_hq',
      organisation: 'ACME Headquarters',
      tenant: 'acme',
      region: 'eu-west-2',
    },
    {
      pk: 'ORG/org_acme_uk',
      sk: 'REGION/eu-west-2/TENANT/acme',
      GSI1PK: 'REGION/eu-west-2/ORG',
      GSI1SK: 'TENANT/acme',
      orgKey: 'org_acme_uk',
      organisation: 'ACME UK Branch',
      tenant: 'acme',
      region: 'eu-west-2',
    },
    {
      pk: 'ORG/org_globex_main',
      sk: 'REGION/eu-west-2/TENANT/globex',
      GSI1PK: 'REGION/eu-west-2/ORG',
      GSI1SK: 'TENANT/globex',
      orgKey: 'org_globex_main',
      organisation: 'Globex Corporation',
      tenant: 'globex',
      region: 'eu-west-2',
    },
    {
      pk: 'ORG/org_globex_other_us',
      sk: 'REGION/us-east-1/TENANT/globex',
      GSI1PK: 'REGION/us-east-1/ORG',
      GSI1SK: 'TENANT/globex',
      orgKey: 'org_globex_other_us',
      organisation: 'Globex Corporation',
      tenant: 'globex',
      region: 'us-east-1',
    },
  ],
};

describe('tenant-config integration tests', () => {
  let client: DynamoDBClient;
  let docClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    client = new DynamoDBClient({
      endpoint: DYNAMODB_ENDPOINT,
      region: AWS_REGION,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
    docClient = DynamoDBDocumentClient.from(client);

    // Delete table if exists
    try {
      await client.send(new DeleteTableCommand({ TableName: TEST_TABLE_NAME }));
      // Wait for deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }

    // Create table with single GSI pattern
    await client.send(
      new CreateTableCommand({
        TableName: TEST_TABLE_NAME,
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      })
    );

    // Wait for table to be active
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Insert test data
    for (const tenant of TEST_DATA.tenants) {
      await docClient.send(
        new PutCommand({ TableName: TEST_TABLE_NAME, Item: tenant })
      );
    }
    for (const org of TEST_DATA.organisations) {
      await docClient.send(
        new PutCommand({ TableName: TEST_TABLE_NAME, Item: org })
      );
    }

    // Wait for GSI to propagate
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up table
    try {
      await client.send(new DeleteTableCommand({ TableName: TEST_TABLE_NAME }));
    } catch {
      // Ignore errors
    }
    client.destroy();
  });

  describe('Query Pattern 1: Get tenant config by name (base table GetItem)', () => {
    it('should retrieve tenant config by exact tenant name', async () => {
      const result = await getTenantConfigFromDynamoDB('acme', 'eu-west-2');

      expect(result).toEqual({
        tenant: 'acme',
        region: 'eu-west-2',
        databases: [
          {
            secretArn:
              'arn:aws:secretsmanager:eu-west-2:123456789:secret:acme-writer',
            type: 'writer',
          },
          {
            secretArn:
              'arn:aws:secretsmanager:eu-west-2:123456789:secret:acme-reader',
            type: 'reader',
          },
        ],
      });
    });

    it('should handle case-insensitive tenant lookup', async () => {
      const result = await getTenantConfigFromDynamoDB('ACME', 'eu-west-2');

      expect(result.tenant).toBe('acme');
    });

    it('should throw error for non-existent tenant', async () => {
      await expect(
        getTenantConfigFromDynamoDB('nonexistent', 'eu-west-2')
      ).rejects.toThrow('Configuration not found for tenant: nonexistent');
    });
  });

  describe('Query Pattern 2: Get all tenants in region (GSI1 query)', () => {
    it('should retrieve all tenants in eu-west-2 region', async () => {
      const results = await getAllTenantConfigs('eu-west-2');

      expect(results).toHaveLength(2);
      expect(results.map((t) => t.tenant).sort()).toEqual(['acme', 'globex']);
    });

    it('should retrieve tenants in us-east-1 region', async () => {
      const results = await getAllTenantConfigs('us-east-1');

      expect(results).toHaveLength(2);
      expect(results.some((r) => r.tenant === 'globex')).toBe(true);
      expect(results.some((r) => r.tenant === 'initech')).toBe(true);
    });

    it('should return empty array for region with no tenants', async () => {
      const results = await getAllTenantConfigs('ap-southeast-1');

      expect(results).toEqual([]);
    });
  });

  describe('Query Pattern 3: Get all orgs for tenant (base table query with SK prefix)', () => {
    it('should retrieve all organisations for acme tenant', async () => {
      const results = await getAllOrganisationsForTenant('eu-west-2', 'acme');

      expect(results).toHaveLength(2);
      expect(results.map((o) => o.orgKey).sort()).toEqual([
        'org_acme_hq',
        'org_acme_uk',
      ]);
    });

    it('should retrieve single organisation for globex tenant', async () => {
      const results = await getAllOrganisationsForTenant('eu-west-2', 'globex');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        orgKey: 'org_globex_main',
        organisation: 'Globex Corporation',
      });
    });

    it('should return empty array for tenant with no orgs', async () => {
      const results = await getAllOrganisationsForTenant(
        'us-east-1',
        'initech'
      );

      expect(results).toEqual([]);
    });
  });

  describe('Query Pattern 4: Find tenant for org (GSI1 query with orgKey)', () => {
    it('should find tenant for acme org', async () => {
      const result = await getTenantForOrganisation('org_acme_hq', 'eu-west-2');

      expect(result).toEqual({
        tenant: 'acme',
        region: 'eu-west-2',
      });
    });

    it('should find tenant for globex org', async () => {
      const result = await getTenantForOrganisation(
        'org_globex_main',
        'eu-west-2'
      );

      expect(result).toEqual({
        tenant: 'globex',
        region: 'eu-west-2',
      });
    });

    it('should return null for non-existent org', async () => {
      const result = await getTenantForOrganisation(
        'org_nonexistent',
        'eu-west-2'
      );

      expect(result).toBeNull();
    });

    it('should return null for org with incorrect region', async () => {
      const result = await getTenantForOrganisation(
        'org_acme_hq',
        'ap-southeast-1'
      );

      expect(result).toBeNull();
    });
  });

  describe('Query Pattern 5: Get all organisations for region (GSI1 query)', () => {
    it('should retrieve all organisations in eu-west-2 region', async () => {
      const results = await getAllOrganisationsForRegion('eu-west-2');
      expect(results).toHaveLength(3);
      const orgKeys = results.map((o) => o.orgKey).sort();
      expect(orgKeys).toEqual([
        'org_acme_hq',
        'org_acme_uk',
        'org_globex_main',
      ]);
    });
  });

  describe('GSI1 key pattern verification', () => {
    it('tenant records should have GSI1PK = REGION#region', async () => {
      // Query GSI1 for eu-west-2 region
      const results = await getAllTenantConfigs('eu-west-2');

      // Should only return tenant records, not org records
      // (Org records have GSI1PK = orgKey which doesn't match REGION# prefix)
      for (const tenant of results) {
        expect(tenant.databases).toBeDefined();
        expect(tenant.databases.length).toBeGreaterThan(0);
      }
    });

    it('org records should have GSI1PK = orgKey for direct lookup', async () => {
      // Each org should be findable by its orgKey via GSI1
      for (const orgData of TEST_DATA.organisations) {
        const result = await getTenantForOrganisation(
          orgData.orgKey,
          orgData.region
        );
        expect(result).not.toBeNull();
        expect(result!.tenant).toBe(orgData.tenant);
      }
    });

    it('should demonstrate single GSI handles both tenant and org queries', async () => {
      // Both queries use GSI1 but with different partition key values:
      // - Tenants: GSI1PK = "REGION/region"
      // - Orgs: GSI1PK = "REGION/eu-west-2/ORG"

      // Query 1: Get all tenants in region (GSI1PK = "REGION/eu-west-2")
      const tenants = await getAllTenantConfigs('eu-west-2');
      expect(tenants.length).toBe(2);

      // Query 2: Find orgs for region (GSI1PK = "REGION/eu-west-2/ORG")
      const orgLookup = await getAllOrganisationsForRegion('eu-west-2');
      expect(orgLookup).not.toBeNull();
      expect(orgLookup.length).toBe(3);

      // Both patterns work with the same GSI!
    });
  });
});
