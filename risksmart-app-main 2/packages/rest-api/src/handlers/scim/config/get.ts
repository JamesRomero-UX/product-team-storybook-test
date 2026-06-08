import axios from 'axios';
import { InternalServerError } from 'http-errors';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { initSentry } from 'src/sentryInit';
import { getSessionData } from 'src/session';
import { signRequest } from 'src/signRequest';
import { z } from 'zod';

import { backendRouteHandler } from '../../../backendActionApiHandler';

const logger = getLogger();

initSentry();

export const handler = backendRouteHandler(z.any(), async (event) => {
  try {
    const sessionData = getSessionData(event.session_variables);
    const orgKey = sessionData.orgKey;

    const scimApiUrl = getEnv('SCIM_INTERNAL_API_URL');
    logger.info('Getting SCIM configuration for organisation', {
      orgKey,
      scimApiUrl,
    });

    const url = `${scimApiUrl}/organisation/${orgKey}/config`;
    const headers = await signRequest(url, 'GET');

    const response = await axios.get(url, {
      headers,
      validateStatus: (status) => status < 500,
    });

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    logger.error('Error calling internal API:', { error });
    throw new InternalServerError('Internal server error');
  }
});
