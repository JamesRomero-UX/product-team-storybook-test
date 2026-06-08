import { PutParameterCommand } from '@aws-sdk/client-ssm';
import type { EventBridgeHandler } from 'aws-lambda';
import { randomBytes } from 'crypto';
import type { DataChangeEvent } from 'src/DataChangeEvent';
import { getSecretByName } from 'src/services/ssm/getSecretByName';
import { getSessionData } from 'src/session';
import type { AuthOrganisation } from 'src/types/AuthOrganisation';
import { ssmClient } from 'src/utils/ssm-client';

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
    const stage = process.env.SST_STAGE;

    if (event.detail.event.op !== 'UPDATE') {
      console.warn('Unsupported operation:', event.detail.event.op);

      return;
    }

    if (!event.detail.event.data.new?.ScimEnabled) {
      console.info('SCIM is not enabled for org:', orgKey);

      return;
    }

    if (event.detail.event.data.old?.ScimEnabled) {
      console.info('SCIM is already enabled for org:', orgKey);

      return;
    }

    // Retrieve the token version from Parameter Store
    const tokenVersionKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/active-version`;
    const currentVersion = (await getSecretByName(tokenVersionKeyName)) ?? 'v0';

    // Increment the version
    const newVersion = `v${parseInt(currentVersion.slice(1)) + 1}`;

    // Create new secret with new version
    const newSecret = randomBytes(32).toString('base64');
    const newTokenSecretKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/${newVersion}`;
    console.info('Creating new token secret:', newTokenSecretKeyName);
    await ssmClient.send(
      new PutParameterCommand({
        Name: newTokenSecretKeyName,
        Value: newSecret,
        Type: 'SecureString',
        Overwrite: false,
      })
    );

    console.info('Incrementing token version:', tokenVersionKeyName);
    await ssmClient.send(
      new PutParameterCommand({
        Name: tokenVersionKeyName,
        Value: newVersion,
        Type: 'String',
        Overwrite: true,
      })
    );
    console.info('Token secret successfully updated', newVersion);
  } catch (error) {
    console.error('Error creating SCIM token secret', error);
    throw error;
  }
};
