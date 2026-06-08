# packages/dlq-replay

Utility to replay messages from AWS SQS Dead Letter Queues to Lambda functions.

## Key Patterns

- Single-file utility (`main.ts`) that polls SQS DLQ, injects tenant info, and invokes Lambda.
- Requires manual configuration of `SQS_QUEUE_URL` and `LAMBDA_FUNCTION_NAME`.
- Tenant list is hardcoded with `nonProd` flags.
- Deletes messages from DLQ after successful Lambda invocation.
- Manual operational tool, no tests.
