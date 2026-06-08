import { Knock } from '@knocklabs/node';
import { KNOCK_CHANNELS } from '@risksmart-app/shared/knock/channels';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { backendRouteHandler } from '../../backendActionApiHandler';
import { slackChannelDataConnectionSchema } from './schema';

const KNOCK_SLACK_CHANNEL_ID = KNOCK_CHANNELS['slack'];
const logger = getLogger();
export const handler = backendRouteHandler(z.any(), async (evt) => {
  const sessionData = getSessionData(evt.session_variables);
  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  try {
    logger.info('Getting knock channel data');
    const channelData = await knockClient.users.getChannelData(
      sessionData.userId,
      KNOCK_SLACK_CHANNEL_ID
    );

    const connections = channelData.data.connections || [];
    if (!Array.isArray(connections)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ connected: false }),
      };
    }

    const connectionExists = connections.some(
      (connection) =>
        slackChannelDataConnectionSchema.safeParse(connection).success
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        connected: connectionExists,
      }),
    };
  } catch (e) {
    logger.error('Error', e as Error);

    return {
      statusCode: 200,
      body: JSON.stringify({ connected: false }),
    };
  }
});
