import { PutParameterCommand } from '@aws-sdk/client-ssm';
import type { EventBridgeHandler } from 'aws-lambda';
import type { DataChangeEvent } from 'src/DataChangeEvent';
import { getLegacyTokenConfig } from 'src/services/dynamo/getLegacyTokenConfig';
import { getTokenConfig } from 'src/services/dynamo/getTokenConfig';
import { revokeLegacyTokensByKeyIds } from 'src/services/dynamo/revokeLegacyTokensByKeyIds';
import { revokeTokensByKeyIds } from 'src/services/dynamo/revokeTokensByKeyIds';
import { getSecretByName } from 'src/services/ssm/getSecretByName';
import { getSessionData } from 'src/session';
import type { AuthOrganisation } from 'src/types/AuthOrganisation';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ssmClient } from 'src/utils/ssm-client';

const stage = process.env.SST_STAGE;

export const handler: EventBridgeHandler<
  string,
  DataChangeEvent<AuthOrganisation, 'auth_organisation'>,
  void
> = async (event) => {
  try {
    console.log('event', event);
    const sessionData = getSessionData(event.detail.event.session_variables);
    const tenant = sessionData.tenant;
    const orgKey = sessionData.orgKey;

    if (event.detail.event.op !== 'UPDATE') {
      console.warn('Unsupported operation:', event.detail.event.op);

      return;
    }

    if (
      event.detail.event.data.new?.ScimEnabled !== false &&
      event.detail.event.data.old?.ScimEnabled !== true
    ) {
      console.info('SCIM is not disabled for org:', orgKey);

      return;
    }

    // Revoke all tokens in dynamodb
    console.log('Revoking SCIM tokens for organisation', orgKey);
    const { tokens } = await getTokenConfig(dynamoClient, orgKey);
    const activeTokenIds = tokens
      .filter(
        (token) => !token.revoked && new Date(token.expires_at) >= new Date()
      )
      .map((token) => token.key_id);
    console.log('Active tokens:', activeTokenIds);

    if (activeTokenIds.length > 0) {
      await revokeTokensByKeyIds(dynamoClient, orgKey, activeTokenIds);
    }

    // Revoke all legacy tokens
    const { legacyTokens } = await getLegacyTokenConfig(dynamoClient, orgKey);
    const legacyTokenIds = legacyTokens.map((token) => token.id);
    if (legacyTokenIds.length > 0) {
      await revokeLegacyTokensByKeyIds(dynamoClient, orgKey, legacyTokenIds);
    }

    // Retrieve the token version from Parameter Store
    const tokenVersionKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/active-version`;
    const currentVersion = (await getSecretByName(tokenVersionKeyName)) ?? 'v0';

    // Overwrite all existing secret versions
    const newSecret = 'REVOKED';
    const versionNumber = parseInt(currentVersion.slice(1));
    for (let i = 1; i <= versionNumber; i++) {
      const version = `v${i}`;
      const newTokenSecretKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/${version}`;
      // Check if the token secret exists
      const tokenSecret = await getSecretByName(newTokenSecretKeyName);
      if (tokenSecret) {
        // Revoke the token secret
        console.info('Revoking token secret:', newTokenSecretKeyName);
        await ssmClient.send(
          new PutParameterCommand({
            Name: newTokenSecretKeyName,
            Value: newSecret,
            Type: 'SecureString',
            Overwrite: true,
          })
        );
      }
    }
    console.info('SCIM tokens successfully revoked for organisation', orgKey);
  } catch (error) {
    console.error('Error revoking SCIM tokens for organisation', error);
    throw error;
  }
};
