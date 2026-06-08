import axios from 'axios';
import { InternalServerError } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { initSentry } from 'src/sentryInit';
import { getSessionData } from 'src/session';
import { signRequest } from 'src/signRequest';

import { deleteSchema } from './deleteSchema';

const logger = getLogger();

initSentry();

export const handler = backendRouteHandler(deleteSchema, async (body) => {
  try {
    logger.debug('body', { body });
    const sessionData = getSessionData(body.session_variables);
    const orgKey = sessionData.orgKey;
    const tenant = sessionData.tenant;
    const domain = body.input.domain;

    const scimApiUrl = getEnv('SCIM_INTERNAL_API_URL');
    logger.info('Deleting SCIM domain for organisation', {
      orgKey,
      scimApiUrl,
      domain,
    });

    const url = `${scimApiUrl}/organisation/${orgKey}/domains`;

    const bodyData = JSON.stringify({ domain, tenant });
    const headers = await signRequest(url, 'DELETE', {}, bodyData);

    logger.info('Calling internal API', { url, domain, tenant });
    const response = await axios.delete(url, {
      data: bodyData,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    logger.info('Internal api responded with status', {
      status: response.status,
    });

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Error calling internal API:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
      if (error.response?.status && error.response.status <= 400) {
        return {
          statusCode: error.response.status,
          body: JSON.stringify(error.response.data),
        };
      }
    }
    logger.error('Error calling internal API:', { error });
    throw new InternalServerError('Internal server error');
  }
});
