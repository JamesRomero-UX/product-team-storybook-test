import { Knock } from '@knocklabs/node';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { backendRouteHandler } from '../../backendActionApiHandler';

const logger = getLogger();

export const handler = backendRouteHandler(z.any(), async (evt) => {
  const sessionData = getSessionData(evt.session_variables);

  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  logger.info('Getting knock preferences for user');
  const preferences = await knockClient.users.getPreferences(
    sessionData.userId,
    { preferenceSet: sessionData.orgKey }
  );

  return {
    statusCode: 200,
    body: JSON.stringify(preferences),
  };
});
