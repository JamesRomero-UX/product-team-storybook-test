import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CLIENT_TABLE = process.env.CLIENT_TABLE!;
const INDEX_NAME = process.env.INDEX_NAME!;
const INDEX_PK_NAME = process.env.INDEX_PK_NAME!;
const INDEX_SK_NAME = process.env.INDEX_SK_NAME!;
const SOURCE_SERVICE = 'external-api';

// Pre Token Generation v2 event types
interface ClaimsOverrideDetails {
  accessTokenGeneration: {
    claimsToAddOrOverride: {
      tenant_id: string;
      org_id: string;
      source_service: string;
      compat_version?: string;
      role: string;
      permissions: string[];
      rl_profile: string;
    };
  };
}

interface PreTokenGenerationV2Event {
  version: '3';
  triggerSource: 'TokenGeneration_ClientCredentials';
  region: string;
  userPoolId: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  userName: string;
  request: {
    userAttributes?: Record<string, string>;
    groupConfiguration?: {
      groupsToOverride?: string[];
      iamRolesToOverride?: string[];
      preferredRole?: string;
    };
    clientMetadata?: Record<string, string>;
    scope?: string;
  };
  response?: {
    claimsAndScopeOverrideDetails?: ClaimsOverrideDetails;
  };
}

interface ClientItem {
  tenantId: string;
  orgId: string;
  status: 'active' | 'removed' | 'pending';
  role?: 'rs-external' | 'rs-internal';
  compatVersion?: string;
  scopes: string;
  rateLimitProfile?: string;
}

// handler for pre token events from cognito, allows for custom
// claims & scopes to be set in JWTs.
export const handler = async (event: PreTokenGenerationV2Event) => {
  const clientId = event.callerContext.clientId;
  if (!clientId) {
    throw new Error('Missing clientId');
  }

  // fetch client details for table
  const queryCommand = new QueryCommand({
    TableName: CLIENT_TABLE,
    IndexName: INDEX_NAME,
    KeyConditionExpression: '#pk = :active AND #sk = :cid',
    ExpressionAttributeNames: {
      '#pk': INDEX_PK_NAME,
      '#sk': INDEX_SK_NAME,
      '#role': 'role',
    },
    ExpressionAttributeValues: { ':active': 'active', ':cid': clientId },
    ProjectionExpression:
      'tenantId, orgId, compatVersion, #role, scopes, rateLimitProfile',
    Limit: 1,
  });

  const { Items = [] } = await ddb.send(queryCommand);

  if (Items.length === 0) {
    throw new Error('Active client not found');
  }
  const [clientItem] = Items;
  const {
    tenantId,
    orgId,
    compatVersion,
    role = 'rs-external',
    scopes = '',
    rateLimitProfile = 'cruise',
  } = clientItem as ClientItem;
  event.response = event.response ?? {};
  event.response.claimsAndScopeOverrideDetails = {
    accessTokenGeneration: {
      claimsToAddOrOverride: {
        tenant_id: tenantId,
        org_id: orgId,
        source_service: SOURCE_SERVICE,
        // optional claims for now.
        compat_version: compatVersion,
        role: role,
        permissions: scopes.split(',').filter(Boolean),
        rl_profile: rateLimitProfile,
      },
    },
  };

  return event;
};
