import { Knock } from '@knocklabs/node';
import { KNOCK_CHANNELS } from '@risksmart-app/shared/knock/channels';
import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getLogger } from 'src/logger';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { getEnv } from '../../environment';
import { getHasuraClaims } from '../../requestHelpers';
import { slackCallbackSchema, slackResponse } from './schema';

const SLACK_CLIENT_ID = getEnv('SLACK_CLIENT_ID');
const KNOCK_SLACK_CHANNEL_ID = KNOCK_CHANNELS['slack'];

const logger = getLogger();

/*
 * This handler is called with a code provided by Slack after the user has
 * authorised the Slack connection for notifications.
 *
 * The code is exchanged for an access token, which is then stored in Knock.
 */
export const handler = frontendApiHandler(z.any(), async (_, evt) => {
  const claims = getHasuraClaims(evt);

  // Get the code and state from request body.
  const parsedBody = slackCallbackSchema.safeParse(JSON.parse(evt.body!));
  if (!parsedBody.success) {
    throw BadRequest('Invalid request body');
  }
  const { code } = parsedBody.data;

  // Send the code to Slack to get an access token.
  const formData = new FormData();
  formData.append('code', code);
  formData.append('client_id', SLACK_CLIENT_ID);
  formData.append('client_secret', Config.SLACK_CLIENT_SECRET);
  logger.info('Slack auth');
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    body: formData,
  });

  // Parse the response
  const json = await response.json();
  const parsed = slackResponse.safeParse(json);
  if (!parsed.success) {
    throw BadRequest('Invalid response from Slack');
  }
  const { data } = parsed;

  if (!data.ok) {
    throw BadRequest(`Slack error: ${data.error}`);
  }

  // Store the access token in Knock.
  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);
  logger.info('Setting user channel data');
  await knockClient.users.setChannelData(
    claims['x-hasura-user-id'],
    KNOCK_SLACK_CHANNEL_ID,
    {
      connections: [
        {
          access_token: data.access_token,
          user_id: data.authed_user.id,
        },
      ],
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Successfully linked Slack account',
    }),
  };
});
