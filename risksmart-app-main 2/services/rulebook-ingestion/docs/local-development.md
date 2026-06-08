# Running the Rulebook Ingestion Service Locally

This guide walks you through running the rulebook ingestion service locally.

## Prerequisites

- Docker running
- Access to the tech-admin AWS account (for the Ascent API key)
- `.env` file configured in `services/rulebook-ingestion/` (see `.env.example`)

## Steps

### 1. Start the API and backend

From the repo root, start the v3 API and backend in separate terminals:

```bash
pnpm run api:v3
```

```bash
pnpm run backend:dev
```

### 2. Create an ingestion config

The service fetches its ingestion config from the data-layer before running. You need to create a config record for your local tenant.

**Option A — via the frontend:**

1. Enable the **Modules** feature for the test org and log in as a **customer support user**.
2. Navigate to **Settings > Modules**.
3. Find the **Regulatory Feed** section and create an ingestion config with:
   - **API Key:** your Ascent API key
   - **Config JSON:**

     ```json
     {
       "baseUrl": "https://your-ascent-instance.ascentregtech.com/api/v0",
       "profileId": "your-profile-id"
     }
     ```

**Option B — directly in the database:**

```sql
INSERT INTO risksmart.ingestion_config ("OrgKey", "IngestionConfig", "SecretArn", "CreatedByUser", "ModifiedByUser")
VALUES (
  'your-org-key',
  '{"baseUrl": "https://your-ascent-instance.ascentregtech.com/api/v0", "profileId": "your-profile-id"}',
  NULL,
  'SYSTEM',
  'SYSTEM'
);
```

> **Note:** `SecretArn` can be left null locally — when `IS_LOCAL=true` the service uses `INGESTION_API_KEY` from your `.env` instead of fetching from Secrets Manager.

### 3. Run the ingestion service locally

In a new terminal, navigate to the rulebook ingestion service and run:

```bash
cd services/rulebook-ingestion
pnpm run run:local
```

### 4. Monitor progress

Get the ingestion run ID from the output, then check progress in the **DynamoDB** console:

- **Table:** Rulebook ingestion table
- **Query:**
  - **PK:** `RUN#<ingestion-run-id>`
  - **SK:** `RUN#<ingestion-run-id>`

The ingestion run record tracks the current phase and per-regulator progress. See the [README](../README.md) for phase details.

### 4. View results

On successful completion, the output (manifest and per-regulator change files) will be written to **S3**. The manifest location is included in the completed ingestion run record.

```text
s3://{bucket}/{runId}/
├── manifest.json
└── regulators/
    ├── {regulatorId1}.json
    ├── {regulatorId2}.json
    └── ...
```
