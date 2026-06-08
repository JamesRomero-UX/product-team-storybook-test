import axios from 'axios';
import { ApiHandler } from 'sst/node/api';

import { getLogger } from '../../logger';
import { getHasuraClaims } from '../../requestHelpers';
const logger = getLogger();

export const handler = ApiHandler(async (evt) => {
  const claims = getHasuraClaims(evt);
  const domain = claims['x-hasura-logo'];

  if (domain) {
    try {
      const response = await axios.get(`https://logo.clearbit.com/${domain}`, {
        responseType: 'arraybuffer',
      });
      const imageBase64 = Buffer.from(response.data, 'binary').toString(
        'base64'
      );

      if (imageBase64) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'image/png',
          },
          body: imageBase64,
          isBase64Encoded: true,
        };
      }
    } catch (e) {
      logger.error('Error getting logo', { e });

      return {
        statusCode: 404,
        body: 'Not Found',
      };
    }
  }

  return {
    statusCode: 404,
    body: 'Not Found',
  };
});
