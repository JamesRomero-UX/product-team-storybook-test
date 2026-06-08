import { ConfidentialClientApplication } from '@azure/msal-node';
import type { SharePointCredentials } from 'src/handlers/data-export/types';
import { getLogger } from 'src/logger';

const logger = getLogger();

export const getMicrosoftGraphApiAccessToken = async (
  credentials: SharePointCredentials
): Promise<string> => {
  const { entraSecretValue, entraClientId, entraTenantId } = credentials;
  const clientId = entraClientId;
  const clientSecret = entraSecretValue;
  const authority = `https://login.microsoftonline.com/${entraTenantId}`;

  const msalConfig = {
    auth: {
      clientId: clientId,
      clientSecret: clientSecret,
      authority: authority,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  try {
    logger.info('Retrieving Microsoft Graph API Bearer token');

    const tokenResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!tokenResponse?.accessToken) {
      throw new Error('Bearer token missing from response');
    }

    return tokenResponse.accessToken;
  } catch (e) {
    logger.error(
      'Failed to acquire Microsoft Graph API Bearer token:',
      e as Error
    );
    throw e;
  }
};
