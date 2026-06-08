# Migration plan from CDK to Tofu

This document outlines the planned migration from the current CDK/SST architecture to a more maintainable structure using Tofu for infrastructure and CDK for application workloads only.

As such, the fate of existing `risksmart-app/cdk-stack/lib/` stacks/resources will be as follows:

- certificatesStack.ts: certificate moves to tofu, hosted zone the lookup is done from will also be moved to tofu
- certificateTenantStack.ts: moves to tofu - REST API's certs can be removed with SST.
- customAppDomainStack.ts: hosted zones/domains - all moves to tofu
- domainIntegrationStack.ts: more hosted zones/domains/nameservers, moves to tofu
- domainsStack.ts: more domains, moves to tofu
- domainTenantStack.ts: tofu
- env.ts: all tenant stuff should go in global tenant config, this file is literally tenant config with some stage variables. Stage vars can stay in CDK if they're needed, or CI variables (Octopus?) pushed there by keybase.
- eventStack.ts: tofu, as this is the shared common event bus
- globalTenantConfigStack.ts: move to tofu as this creates the global tables/underlying resources necessary for setting up tenant config
- parametersStack.ts: keybase with tofu, this is the hasura admin secret - can be removed when hasura is gone
- removalPolicyRetainAspect.ts: this was added in when doing "stack splitting" work to stop us destroying resources accidentally. We will probably keep this for tenant stuff that remains in here.
- tenantBackupRegionDRStack.ts: To be removed completely, as no longer needed / backups already merged in another PR
- thirdPartyPortalStack.ts: Move to tofu. Cloudfront, DNS, S3 and productlane - static but deployed on top of elsewhere.
- webStack.ts: Cloudfront, DNS, S3 again. Move to Tofu, as these are pretty static resources that are deployed on top of.
- tenantDRStack.ts: Moves to Tenant Deployer (CDK), as part of dynamic tenant deployments.
- tenantHasuraStack.ts: Ultimately will be removed when Hasura dies. can stay for now but move into Tenant Deployer, and then we just kill it when Hasura goes.
- tenantDBStack.ts: The meat & bones of a "tenant" - RDS DB, KMS Key, secrets. Moves to Tenant Deployer.
- tenantStack.ts: Lots in here, so will split by resource.
  1. All networking (VPC, ALB, VPN, SGs, WAF, listeners etc.) - tofu
  1. Certs - tofu
  1. Hosted zones / DNS - tofu
  1. Cloudfront - tofu
  1. ECS Clusters - tofu
  1. Fargate tasks & definitions (hasura, n8n, trpc, etc.) - separate pipeline/process, stay in CDK
  1. Secrets - keybase for devs to place them in relevant locations. These get pushed up to AWS from keybase by Tofu in a "Secrets Pipeline". CDK can look up these resources that now exist in AWS.
- tenantDeployerStack.ts: remain as-is, as designed for v3.

SST has been replaced by AWS CDK + SAM for local development. CDK synth generates CloudFormation templates, and SAM runs Lambda functions locally. Individual AWS services are emulated by lightweight Docker containers:

- **DynamoDB**: DynamoDB Local (`amazon/dynamodb-local`)
- **S3**: RustFS
- **SQS**: ElasticMQ (`softwaremill/elasticmq-native`)
- **EventBridge**: Custom local event router (`scripts/local-event-router/`)
- **Firehose**: Custom mock (`scripts/local-mocks/firehose-mock.js`)
- **SQS → Lambda triggers**: Custom SQS poller (`scripts/local-mocks/sqs-poller.js`)
- **Lambda execution**: AWS SAM CLI (`sam local start-api` / `sam local start-lambda`)

The `node scripts/dev.js` script orchestrates everything: CDK synth, SAM startup, event routing, SQS polling, and tRPC container restart.

"dev-cloud" then becomes more of an integration environment, with faster, lightweight pipelines and smoke tests to prove the things that we can't test locally (IAM permissions, real event triggers etc.)

The REST API / SST deploy stuff is currently in `risksmart-app/api-stack`. Read the README in there.

Notifications stack, event stack, all have stateful components that will need to be handled carefully.

Event-proxy will no longer be necessary when SST goes.
-- The below needs reviewing in a world without localstack.
Localstack will be able to mock the following resource types:

- API Gateway
- Backup
- CloudFormation
- CloudFront
- CloudTrail
- CloudWatch
- CloudWatch Logs
- Cognito
- DMS
- DynamoDB
- DynamoDB Streams
- ECS
- S3
- Lambda
- ECR

Hence, everything we use split across CDK and Tofu should be mockable locally with `cdk-local` and `opentofu-local`.

The priority is creating a migration plan for SST to CDK-local.
