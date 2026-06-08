import { ManagementClient } from 'auth0';
import { getEnv } from 'src/environment';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getAuth0ManagementClient = () => {
  const domain = getEnv('AUTH0_DOMAIN');

  logger.info('Creating Auth0 ManagementClient for domain', domain);

  return new ManagementClient({
    domain,
    clientId: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
    clientSecret: Config.AUTH0_CLIENT_SECRET,
  });
};
