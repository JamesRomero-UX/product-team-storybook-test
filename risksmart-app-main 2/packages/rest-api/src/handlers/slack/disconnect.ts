import { Knock } from '@knocklabs/node';
import { KNOCK_CHANNELS } from '@risksmart-app/shared/knock/channels';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';
import { z } from 'zod';

const KNOCK_SLACK_CHANNEL_ID = KNOCK_CHANNELS['slack'];

const logger = getLogger();

export const handler = backendRouteHandler(z.any(), async (evt) => {
  const sessionData = getSessionData(evt.session_variables);
  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);
  logger.info('Setting user channel data');
  await knockClient.users.setChannelData(
    sessionData.userId,
    KNOCK_SLACK_CHANNEL_ID,
    { connections: [] }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Successfully unlinked Slack account',
    }),
  };
});
