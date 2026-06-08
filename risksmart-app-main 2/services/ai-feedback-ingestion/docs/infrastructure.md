# Infrastructure

## Overview

The AI Feedback Ingestion service requires:

| Component                | Scope      | Managed By            |
| ------------------------ | ---------- | --------------------- |
| Lambda function          | Global     | SST                   |
| Firehose delivery stream | Per-tenant | CDK (tenant-deployer) |
| S3 bucket                | Per-tenant | CDK (tenant-deployer) |
| Glue database & table    | Global     | Tofu/Terraform        |
| IAM roles                | Both       | SST + CDK             |

## Per-Tenant Infrastructure (CDK)

Each tenant gets their own Firehose delivery stream that writes to their S3 bucket.

### Location

`packages/tenant-deployer/lib/aiFeedbackStack.ts`

### Resources Created

```
ai-feedback-{tenantId}           # Firehose delivery stream
└── Destination: s3://{tenant-bucket}/ai-feedback/
    └── Partitioned by: workstream, year, month, day
    └── Format: Parquet (Snappy compression)
```

### Key Configuration

```typescript
// Dynamic partitioning extracts workstream from JSON
dynamicPartitioningConfiguration: {
  enabled: true,
},
processingConfiguration: {
  processors: [{
    type: 'MetadataExtraction',
    parameters: [{
      parameterName: 'MetadataExtractionQuery',
      parameterValue: '{workstream:.workstream}',
    }],
  }],
},
// S3 prefix with partitions
extendedS3DestinationConfiguration: {
  prefix: 'ai-feedback/workstream=!{partitionKeyFromQuery:workstream}/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/',
  errorOutputPrefix: 'ai-feedback-errors/',
},
```

## Global Infrastructure (Tofu/Terraform)

The Glue catalog is shared across all tenants for querying.

### Glue Database

```hcl
resource "aws_glue_catalog_database" "ai_analytics" {
  name = "ai_analytics"
}
```

### Glue Table

```hcl
resource "aws_glue_catalog_table" "ai_feedback" {
  name          = "ai_feedback"
  database_name = aws_glue_catalog_database.ai_analytics.name
  table_type    = "EXTERNAL_TABLE"

  parameters = {
    "classification"  = "parquet"
    "parquet.compression" = "SNAPPY"
  }

  storage_descriptor {
    location      = "s3://*/ai-feedback/"  # Cross-bucket
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }

    columns {
      name = "id"
      type = "string"
    }
    columns {
      name = "tenantid"
      type = "string"
    }
    columns {
      name = "userid"
      type = "string"
    }
    columns {
      name = "langsmithrunid"
      type = "string"
    }
    columns {
      name = "feedbacktype"
      type = "string"
    }
    columns {
      name = "comment"
      type = "string"
    }
    columns {
      name = "timestamp"
      type = "string"
    }
    columns {
      name = "values"
      type = "string"
    }
  }

  partition_keys {
    name = "workstream"
    type = "string"
  }
  partition_keys {
    name = "year"
    type = "string"
  }
  partition_keys {
    name = "month"
    type = "string"
  }
  partition_keys {
    name = "day"
    type = "string"
  }
}
```

## Lambda (SST)

The Lambda is deployed via SST and needs:

### Environment Variables

```typescript
environment: {
  LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,
  LANGSMITH_ENDPOINT: process.env.LANGSMITH_ENDPOINT,
}
```

### IAM Permissions

```typescript
permissions: [
  // Firehose write access (all tenant streams)
  new iam.PolicyStatement({
    actions: ['firehose:PutRecord', 'firehose:PutRecordBatch'],
    resources: ['arn:aws:firehose:*:*:deliverystream/ai-feedback-*'],
  }),
];
```

## Querying with Athena

### Setup Partitions

Run once after deploying (or use Glue Crawler):

```sql
MSCK REPAIR TABLE ai_analytics.ai_feedback;
```

### Example Queries

```sql
-- All feedback for a tenant
SELECT *
FROM ai_analytics.ai_feedback
WHERE tenantid = 'tenant-abc';

-- AI assistant feedback with session details
SELECT
  id,
  feedbacktype,
  timestamp,
  JSON_EXTRACT_SCALAR(values, '$.sessionId') as session_id,
  JSON_EXTRACT_SCALAR(values, '$.responseId') as response_id
FROM ai_analytics.ai_feedback
WHERE workstream = 'ai-assistant'
  AND year = '2024'
  AND month = '12';

-- Feedback summary by workstream
SELECT
  workstream,
  feedbacktype,
  COUNT(*) as count
FROM ai_analytics.ai_feedback
GROUP BY workstream, feedbacktype;

-- workflow feedback with workflow name
SELECT
  id,
  feedbacktype,
  JSON_EXTRACT_SCALAR(values, '$.workflowName') as workflow_name
FROM ai_analytics.ai_feedback
WHERE workstream = 'workflow';
```

## Deployment Order

1. **Tofu**: Deploy Glue database/table (global, one-time)
2. **CDK**: Deploy tenant Firehose streams (per-tenant onboarding)
3. **SST**: Deploy Lambda (CI/CD pipeline)

## Monitoring

### CloudWatch Metrics

- `Firehose/DeliveryToS3.Records` - Records written
- `Firehose/DeliveryToS3.DataFreshness` - Latency
- `Lambda/Invocations` - API calls
- `Lambda/Errors` - Failed requests

### Alarms to Consider

- Firehose delivery failures
- Lambda error rate > threshold
- S3 storage growth anomalies
