# CDK Infra

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `pnpm run build` compile typescript to js
- `pnpm run watch` watch for changes and compile
- `pnpm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Creates a new environment

1. Create a hosted zone in route 53
   `[admin account no].risksmart.link`
1. Create a new stage env file
   `lib/envSettings/[newStage].ts`
   and reference in lib/env.ts
1. Bootstrap account
   ```sh
   AWS_PROFILE=risksmart-[stage] pnpm cdk bootstrap
   ```
1. Build `packages/integrations`, then move whole folder to `lib/int`
1. Run
   ```sh
   AWS_PROFILE=risksmart-[stage] pnpm cdk_deploy
   ```
1. The deployment process will halt after each certificate is created. You will need to manually navigate to the certificates page in the AWS console and click "Create route 53 records" for the pending certificate(s).
   You will also need to ensure the NS records for the appropriate certificate domain have been delegated in the root account. This has to be done mid-deployment as a stack creates one of the Hosted zone that need to be delegated.
1. When a new hasura task is creates in fargate, it will constants be destroyed and re-created as the hasura-migrate step hasn't run, so the hasura database won't exists. To avoid this, you can initially set hasuraDesiredTaskCount=0,hasuraMinTaskCount=0 and hasuraMaxTaskCount=0.

## Pain points

The CertificatesStack stack currently has a hack in it (lookupByName=true) which was used as a temporary workaround due to a mismatching hosted zones resource id in staging.
This hack doesn't appear to play nicely with newly created stacks, however, running the deploy step several times seems to be a work around (or possibly deploying each stack 1 at a time)

The stacks use cross-region references which makes updating outputs of the stacks difficult.

## Moving resources between stacks

### Moving AWS Backup Vault

1. tenantDRStack - Create new stacks (1 per tenant)
1. tenantStack - Set deletion policy to retain on vault (should default to retain, but just to be on the safe side!)
1. tenantStack & tenantDRStack - Create any cross stack references required by the resources to be moved explicitly (as the auto generated stack references won't exist during the cdk import)
1. Deploy above CDK Changes
1. tenantStack - Remove AWS Backup Vault, Plan and Selection (Plan and Selection will be deleted, both will get re-created in tenantDRStack in a later step)
1. Deploy above CDK Changes
1. tenantDRStack - Add Backup Vault to tenantDRStack (Do NOT deploy CDK Changes)
1. Update local .env file to contain stage appropriate values i.e. update AWS_ACCOUNT_ID & STAGE
1. Run `pnpm cdk import [name of tenantDRStack]` e.g.`pnpm cdk import dev-cloud-risksmartApp-MultiTenant-TenantDRStack` for each tenant in the environment. This will add the aws vault to the tenantDRStack
1. Deploy CDK Changes
1. tenantDRStack - add Plan and Selection resources to tenantDRStack stack
1. Deploy CDK Changes

### Move Hasura Fargate service

1. tenantHasuraStack - Create new stack with Fargate service, Task definition, target group, and ApplicationListenerRule which has a high priority then the original rule
1. Deploy above CDK Changes
1. tenantStack - Remove original listener rule and target group
1. Deploy above CDK Changes
1. tenantStack - Remove Fargate service, Task definition
1. Deploy above CDK Changes
1. tenantHasuraStack - update ApplicationListenerRule to values original in tenantHasuraStack
1. Deploy above CDK Changes

### Moving DB Resources

1. tenantStack - use an aspect to retain all resources
1. tenantStack - create new security group for db so we can get it via a lookup in the hasura stack
1. tenantStack - update tenant settings to remove database proxies (databaseEnableProxy = false). This is due to a bug with importing proxy target groups into new stacks
1. Update the secret [stage]-risksmartApp-[tenant]-ConnectionSecret for all tenants that previously had databaseEnableProxy=true to point directly to the database and not the proxy. This will avoid any down time whilst the proxy is removed (and later re-created)
1. Restart the hasura tasks for tenants that were using the database proxy.
1. tenantStack - create a unique ParameterGroup per tenant database (as cdk/cloudformation attempts to removed the shared parameter group from the stack)
1. tenantStack - explicitly export the following: connectionSecret.secretArn,databaseCluster.clusterIdentifier and every isolated subset id for the vpc (this is required due to the way cdk removed cross stack references when they aren't used)
1. tenantStack - add an alias to the kms key (this is so we can do a lookup in the tenantDRStack in a later deployment without knowing the arn)
1. tenantStack - set cloudwatchLogsExports to undefined on the cluster (cdk import doesn't support importing policies which get creating by the log exporter)
1. tenantDBStack - create new empty DB stack for each tenant
1. tenantDRStack - retrieve databaseCluster by lookup (as can't use cross stack reference as resource is being moved to another stack!)
1. tenantHasuraStack - retrieve databaseCluster, db security group and connectionSecret by lookup (as can't use cross stack reference as resource is being moved to another stack!)
1. Deploy above CDK Changes
1. Ensure app is working for tenants with and without an rds proxy
1. tenantDRStack - retrieve kms key by alias rather then arn (then we can delete the export from the tenant stack)
1. Deploy above CDK Changes
1. tenantStack - remove all tenant specific resources from the tenantStack
1. Deploy above CDK Changes
1. tenantDBStack - Add all the tenant specific resources that were removed from tenantStack
1. Run `pnpm cdk import [name of tenantDBStack] --record-resource-mapping [tenant].json` for each tenant
1. Run `pnpm cdk import [name of tenantDBStack] --resource-mapping [tenant].json` for each tenant
1. Deploy above CDK Changes
1. Re-enable databaseEnableProxy for all customers that previous had it enabled.
1. tenantDBStack - set cloudwatchLogsExports back to ['postgresql']
1. tenantDRStack/tenantHasuraStack - replace lookups with cross stack references
1. tenantStack - remove aspect that was retaining all resources on deletion
1. Restart the hasura tasks for tenants using the database proxy.

## Moving docker images to ECR

See https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

### Hasura Image

1. `aws ecr get-login-password --region region | docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com`
   e.g. `AWS_PROFILE=risksmart-tech-admin aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 046657674620.dkr.ecr.eu-west-2.amazonaws.com`
2. `docker tag e9ae3c220b23 aws_account_id.dkr.ecr.region.amazonaws.com/my-repository:tag`
   e.g. `docker tag hasura/graphql-engine:v2.48.11 046657674620.dkr.ecr.eu-west-2.amazonaws.com/hasura/graphql-engine:v2.48.11`
   3 `docker push aws_account_id.dkr.ecr.region.amazonaws.com/my-repository:tag` e.g. `docker push 046657674620.dkr.ecr.eu-west-2.amazonaws.com/hasura/graphql-engine:v2.48.11`

## For new account/region deploys

also refer to infrastructure-aws/README.md, as there are dependent resources in there.

## Deploying cdk stack from local

1. Install aws-cdk cli
   - `npm install -g aws-cdk`

2. Set up .env file in cdk-stack folder

   ```
   APP_NAME=risksmartApp
   TPP_APP_NAME=third-party-portal
   STAGE=tech-admin
   AWS_ACCOUNT_ID=046657674620
   AWS_REGION=eu-west-2
   BASE_DOMAIN=risksmart.link
   HASURA_JWT_SECRET={"type":"RS256","jwk_url": "https://dev-t8t3iey3b54zkh7i.uk.auth0.com/.well-known/jwks.json", "allowed_skew": 600}
   HASURA_GRAPHQL_ENABLE_CONSOLE=true
   HASURA_GRAPHQL_PG_CONNECTIONS=100
   HASURA_GRAPHQL_LOG_LEVEL=debug
   VPN_ENABLED=false
   TRPC_CONTAINER_BUILD=feb27fe
   TENANT_DEPLOYER_CONTAINER_BUILD=4ae496e
   ```

3. Build integrations package from root
   - `pnpm run --filter n8n-nodes-risksmart build`

   - Copy all files from packages/integrations to cdk-stack/lib/int

4. Run synth command
   - `AWS_PROFILE=tech-admin AWS_REGION=eu-west-2 pnpm cdk synth`

5. Run deploy command
   - `AWS_PROFILE=tech-admin AWS_REGION=eu-west-2 pnpm cdk_deploy`
