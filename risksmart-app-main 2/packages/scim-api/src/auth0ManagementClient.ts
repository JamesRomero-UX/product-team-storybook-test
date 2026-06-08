import { ManagementClient } from 'auth0';
import { Config } from 'sst/node/config';

import { getEnv } from './environment';

export const getAuth0ManagementClient = () =>
  new ManagementClient({
    domain: getEnv('AUTH0_DOMAIN'),
    clientId: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
    clientSecret: Config.AUTH0_CLIENT_SECRET,
  });
