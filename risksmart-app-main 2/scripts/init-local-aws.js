#!/usr/bin/env node

/**
 * Local AWS Services Initialization
 *
 * Initializes all local AWS service emulators:
 * - DynamoDB Local: Creates tables and loads seed data
 * - RustFS (S3): Creates required buckets
 * - ElasticMQ (SQS): Queues are pre-configured via elasticmq.conf
 *
 * Usage:
 *   node scripts/init-local-aws.js
 *
 * Environment variables:
 *   DYNAMODB_ENDPOINT  (default: http://localhost:8000)
 *   S3_ENDPOINT        (default: http://localhost:9000)
 *   SQS_ENDPOINT       (default: http://localhost:9324)
 *   AWS_REGION         (default: eu-west-2)
 */

import {
  CreateTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';
import {
  CreateBucketCommand,
  S3Client,
  BucketAlreadyExists,
  BucketAlreadyOwnedByYou,
} from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the monorepo root.
// When running on the host: __dirname = /path/to/risksmart-app/scripts → ROOT = /path/to/risksmart-app
// When running in the aws-init Docker container: __dirname = /tmp/aws-init → dynamo/ is at /dynamo
const hostRoot = path.resolve(__dirname, '..');
const ROOT = fs.existsSync(path.join(hostRoot, 'dynamo')) ? hostRoot : '/';

const DYNAMODB_ENDPOINT =
  process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const AWS_REGION = process.env.AWS_REGION || 'eu-west-2';

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
};

// ─── DynamoDB ────────────────────────────────────────────────────

const dynamoClient = new DynamoDBClient({
  endpoint: DYNAMODB_ENDPOINT,
  region: AWS_REGION,
  credentials,
});

async function initDynamoDB() {
  console.log(`\n--- DynamoDB (${DYNAMODB_ENDPOINT}) ---`);

  const schemasDir = path.join(ROOT, 'dynamo', 'schemas');
  if (!fs.existsSync(schemasDir)) {
    console.log('  No schemas directory found, skipping.');
    return;
  }

  const schemaFiles = fs
    .readdirSync(schemasDir)
    .filter((f) => f.endsWith('.json'));

  for (const file of schemaFiles) {
    const schema = JSON.parse(
      fs.readFileSync(path.join(schemasDir, file), 'utf8')
    );
    const tableName = schema.TableName;
    try {
      await dynamoClient.send(new CreateTableCommand(schema));
      console.log(`  Created table: ${tableName}`);
    } catch (error) {
      if (error instanceof ResourceInUseException) {
        console.log(`  Table exists: ${tableName}`);
      } else {
        throw error;
      }
    }
  }

  // Create per-tenant tables (not in dynamo/schemas/ — defined in CDK)
  const tenantTables = [
    {
      TableName: 'tech-admin-risksmartApp-multitenant-RequestEventTable',
      KeySchema: [
        { AttributeName: '_id', KeyType: 'HASH' },
        { AttributeName: '_rng', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: '_id', AttributeType: 'S' },
        { AttributeName: '_rng', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    },
  ];

  for (const schema of tenantTables) {
    try {
      await dynamoClient.send(new CreateTableCommand(schema));
      console.log(`  Created table: ${schema.TableName}`);
    } catch (error) {
      if (error instanceof ResourceInUseException) {
        console.log(`  Table exists: ${schema.TableName}`);
      } else {
        console.error(`  Error creating ${schema.TableName}:`, error.message);
      }
    }
  }

  // Load seed data
  const dataDir = path.join(ROOT, 'dynamo', 'data');
  if (fs.existsSync(dataDir)) {
    const dataFiles = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith('.json'));
    for (const file of dataFiles) {
      const item = JSON.parse(
        fs.readFileSync(path.join(dataDir, file), 'utf8')
      );
      try {
        // Data files use DynamoDB marshalled format ({"S": "value"})
        // so we use PutItemCommand (low-level) not DocumentClient PutCommand
        await dynamoClient.send(
          new PutItemCommand({ TableName: 'TenantConfig', Item: item })
        );
        console.log(`  Loaded seed data: ${file}`);
      } catch (error) {
        console.error(`  Error loading ${file}:`, error.message);
      }
    }
  }

  const tables = await dynamoClient.send(new ListTablesCommand({}));
  console.log(`  Tables: ${(tables.TableNames || []).join(', ')}`);
}

// ─── S3 (RustFS) ──────────────────────────────────────────────────

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: AWS_REGION,
  credentials,
  forcePathStyle: true,
});

/**
 * S3 buckets required locally.
 * Derived from CDK stack definitions:
 * - RulebookIngestionStack: rulebook-changes
 * - RestApiStack: org-files, data-export
 * - AiFeedbackStack: ai-feedback (per tenant)
 */
const S3_BUCKETS = [
  'tech-admin-rulebook-changes',
  'tech-admin-risksmart-org-files',
  'tech-admin-risksmart-data-export',
  'tech-admin-risksmartapp-multitenant-ai-feedback',
];

async function initS3() {
  console.log(`\n--- S3 / RustFS (${S3_ENDPOINT}) ---`);

  for (const bucket of S3_BUCKETS) {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
      console.log(`  Created bucket: ${bucket}`);
    } catch (error) {
      if (
        error instanceof BucketAlreadyExists ||
        error instanceof BucketAlreadyOwnedByYou ||
        error.name === 'BucketAlreadyOwnedByYou'
      ) {
        console.log(`  Bucket exists: ${bucket}`);
      } else {
        console.error(`  Error creating ${bucket}:`, error.message);
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('Initializing local AWS services...');

  await initDynamoDB();
  await initS3();

  // SQS queues are configured via elasticmq.conf (no init needed)
  console.log(`\n--- SQS / ElasticMQ ---`);
  console.log('  Queues pre-configured via elasticmq.conf');

  console.log('\nLocal AWS services initialization complete.');
}

main().catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
