import { RemovalPolicy } from 'aws-cdk-lib';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import fs from 'fs';
import { Api, Function, StackContext, Table, use } from 'sst/constructs';

import { getEnv } from './environment';
import { isLocal } from './isLocal';
import { Secrets } from './SecretsStack';
import { SharedInfraStack } from './SharedInfraStack';
import { getFunctionVpcProps } from './vpc';

import {
  DOMAIN_NAME_PREFIX,
  TABLE_NAME_SCIM_API_AUTH_V1,
  TABLE_NAME_SCIM_API_KEYS_V2,
  RISKSMART_REGION_PREFIX,
} from './constants';

export function ScimApi({ stack }: StackContext) {
  const { HASURA_ADMIN_SECRET } = use(Secrets);
  const { sharedEventBus, dataChangeDlq: sharedDataChangeDlq } =
    use(SharedInfraStack);

  const vpcSettings = getFunctionVpcProps(stack);

  const handlersDir = 'packages/scim-api/src/handlers';

  const environment = {
    AUTH0_DOMAIN: getEnv('AUTH0_DOMAIN'),
    AUTH0_MANAGEMENT_CLIENT_ID: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
    HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
  };

  const authTableV1 = new Table(stack, TABLE_NAME_SCIM_API_AUTH_V1, {
    fields: {
      id: 'string',
      orgKey: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
    globalIndexes: {
      orgKeyIndex: {
        partitionKey: 'orgKey',
      },
    },
    cdk: {
      table: {
        deletionProtection: !isLocal(stack.stage),
      },
    },
  });

  const authTableV2 = new Table(stack, TABLE_NAME_SCIM_API_KEYS_V2, {
    fields: {
      client_id: 'string',
      key_id: 'string',
    },
    primaryIndex: { partitionKey: 'client_id', sortKey: 'key_id' },
    cdk: {
      table: {
        billingMode: BillingMode.PAY_PER_REQUEST,
        deletionProtection: !isLocal(stack.stage),
        removalPolicy: isLocal(stack.stage)
          ? RemovalPolicy.DESTROY
          : RemovalPolicy.RETAIN,
      },
    },
  });

  const lambdaAuthorizerFunction = new Function(
    stack,
    'BearerTokenAuthorizer',
    {
      handler: `${handlersDir}/auth/bearerTokenAuthorizer.handler`,
      functionName: `${stack.stage}-bearerTokenAuthorizer`,
      bind: [authTableV1, authTableV2],
      ...vpcSettings,
      permissions: [
        new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          resources: [
            `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${stack.stage}/scim-api/*`,
          ],
        }),
      ],
    }
  );
  const api = new Api(stack, `${RISKSMART_REGION_PREFIX}ScimApi`, {
    authorizers: {
      bearerTokenAuthorizer: {
        type: 'lambda',
        function: lambdaAuthorizerFunction,
      },
    },
    defaults: {
      authorizer: 'bearerTokenAuthorizer',
      function: {
        ...vpcSettings,
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
        },
        nodejs: {
          sourcemap: true,
        },
      },
    },
    customDomain: isLocal(stack.stage)
      ? undefined
      : {
          domainName: `scim-api.${DOMAIN_NAME_PREFIX}${
            stack.stage === 'prod' ? 'app' : stack.stage
          }.risksmart.link`,
        },
    routes: {
      'GET /scim/Users': {
        function: {
          handler: `${handlersDir}/http/users/get-by-query/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-getUsersByQuery`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'POST /scim/Users': {
        function: {
          handler: `${handlersDir}/http/users/create/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-createUser`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'GET /scim/Users/{userId}': {
        function: {
          handler: `${handlersDir}/http/users/get-by-id/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-getUserById`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'PATCH /scim/Users/{userId}': {
        function: {
          handler: `${handlersDir}/http/users/update/patch/patch.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-updateUser`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'PUT /scim/Users/{userId}': {
        function: {
          handler: `${handlersDir}/http/users/update/put/put.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-updateUserPut`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'DELETE /scim/Users/{userId}': {
        function: {
          handler: `${handlersDir}/http/users/delete/delete.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-deleteUser`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'GET /scim/Schemas': {
        function: {
          handler: `${handlersDir}/http/schemas/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-getSchemas`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'GET /scim/ServiceProviderConfig': {
        function: {
          handler: `${handlersDir}/http/service-provider-config/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-getServiceProviderConfig`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'GET /scim/ResourceTypes': {
        function: {
          handler: `${handlersDir}/http/resource-types/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-getResourceTypes`,
          bind: [HASURA_ADMIN_SECRET],
          environment,
        },
      },
    },
  });

  const internalApi = new Api(stack, 'ScimInternalApi', {
    defaults: {
      function: {
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
        },
        nodejs: {
          sourcemap: true,
        },
      },
      authorizer: 'iam',
    },
    customDomain: isLocal(stack.stage)
      ? undefined
      : {
          domainName: `scim-api-internal.${DOMAIN_NAME_PREFIX}${
            stack.stage === 'prod' ? 'app' : stack.stage
          }.risksmart.link`,
        },
    routes: {
      'GET /organisation/{orgKey}/config': {
        function: {
          handler: `${handlersDir}/internal/http/config/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-internal-getConfig`,
          bind: [authTableV2, authTableV1],
          environment,
        },
      },
      'POST /organisation/{orgKey}/domains': {
        function: {
          handler: `${handlersDir}/internal/http/domains/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-internal-addDomain`,
          bind: [authTableV2, HASURA_ADMIN_SECRET],
          environment,
        },
      },
      'DELETE /organisation/{orgKey}/domains': {
        function: {
          handler: `${handlersDir}/internal/http/domains/delete.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-internal-deleteDomain`,
          bind: [authTableV2],
          environment,
        },
      },
      'POST /organisation/{orgKey}/tokens': {
        function: {
          handler: `${handlersDir}/internal/http/tokens/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-internal-createToken`,
          bind: [authTableV2, authTableV1],
          environment,
          permissions: [
            new iam.PolicyStatement({
              actions: ['ssm:GetParameter'],
              resources: [
                `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${stack.stage}/scim-api/*`,
              ],
            }),
          ],
        },
      },
      'DELETE /organisation/{orgKey}/tokens/{tokenId}': {
        function: {
          handler: `${handlersDir}/internal/http/tokens/delete.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-internal-deleteToken`,
          bind: [authTableV2],
          environment,
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onScimEnabledTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE'],
          },
          table: {
            schema: ['auth'],
            name: ['organisation'],
          },
        },
      },
      targets: {
        onScimEnabled: {
          function: {
            handler: `${handlersDir}/internal/event/onScimEnabled.handler`,
            functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-onScimEnabled`,
            environment,
            permissions: [
              new iam.PolicyStatement({
                actions: ['ssm:GetParameter', 'ssm:PutParameter'],
                resources: [
                  `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${stack.stage}/scim-api/*`,
                ],
              }),
            ],
            deadLetterQueue: sharedDataChangeDlq,
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onScimDisabledTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE'],
          },
          table: {
            schema: ['auth'],
            name: ['organisation'],
          },
        },
      },
      targets: {
        onScimDisabled: {
          function: {
            handler: `${handlersDir}/internal/event/onScimDisabled.handler`,
            functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-scim-onScimDisabled`,
            environment,
            bind: [authTableV2, authTableV1],
            permissions: [
              new iam.PolicyStatement({
                actions: ['ssm:GetParameter', 'ssm:PutParameter'],
                resources: [
                  `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${stack.stage}/scim-api/*`,
                ],
              }),
            ],
            deadLetterQueue: sharedDataChangeDlq,
          },
        },
      },
    },
  });

  stack.addOutputs({
    Stage: stack.stage,
    Region: stack.region,
    ScimApiKeysV1TableName: authTableV1.tableName,
    ScimApiKeysV2TableName: authTableV2.tableName,
    ScimApiEndpoint: api.url,
    ScimInternalApiEndpoint: internalApi.url,
  });

  return { authTable: authTableV1 };
}
