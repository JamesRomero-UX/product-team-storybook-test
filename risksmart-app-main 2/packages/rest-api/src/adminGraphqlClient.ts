import { Config } from 'sst/node/config';

import { getHasuraClient } from './graphqlClient';

export const getHasuraAdminClient = (tenantName: string) => {
  return getHasuraClient({
    adminSecret: Config.HASURA_ADMIN_SECRET,
    tenantName,
  });
};
