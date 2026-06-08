import { STSClient } from '@aws-sdk/client-sts';
import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import type { AwsCredentialIdentity } from '@aws-sdk/types';

import { getEnv } from './environment';

export const getOrgCredentials = async (
  org: string
): Promise<AwsCredentialIdentity> => {
  const stsClient = new STSClient({});

  const command = new AssumeRoleCommand({
    DurationSeconds: 900,
    // Tag required for role.
    // Ensures user can only access objects prefixes with the organisation id
    Tags: [
      {
        Key: 'OrganisationId',
        Value: org,
      },
    ],
    RoleSessionName: 'OrgAssumedRole',
    RoleArn: getEnv('ORG_ROLE_ARN'),
  });

  const { Credentials } = await stsClient.send(command);
  if (!Credentials) {
    throw new Error('Failed to get temporary credentials');
  }

  return {
    accessKeyId: Credentials.AccessKeyId!,
    secretAccessKey: Credentials.SecretAccessKey!,
    sessionToken: Credentials.SessionToken,
    expiration: Credentials.Expiration,
  };
};
