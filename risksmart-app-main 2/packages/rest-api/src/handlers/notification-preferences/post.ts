import { Knock } from '@knocklabs/node';
import type { PreferencesSet } from '@risksmart-app/shared/knock/schemas';
import { preferencesSetSchema } from '@risksmart-app/shared/knock/schemas';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { backendRouteHandler } from '../../backendActionApiHandler';

const bodySchema = z.object({
  preferenceSet: preferencesSetSchema,
});
const logger = getLogger();

export const handler = backendRouteHandler(bodySchema, async (evt) => {
  const { preferenceSet } = evt.input;
  const sessionData = getSessionData(evt.session_variables);
  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  // Log the preference set being sent to Knock
  logger.info('Setting knock use preferences', {
    userId: sessionData.userId,
    orgKey: sessionData.orgKey,
    preferenceSet,
  });

  await knockClient.users.setPreferences(
    sessionData.userId,
    preferenceSet as PreferencesSet,
    {
      preferenceSet: sessionData.orgKey,
    }
  );

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Preferences updated',
    }),
  };
});
