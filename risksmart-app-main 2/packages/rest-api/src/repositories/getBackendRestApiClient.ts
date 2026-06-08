import type { Sdk } from 'generated/graphql2';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';

import { getRisksmartApiClient } from './getRisksmartApiClient';
import type { RepositoryOptions } from './types';

export const getBackendRestApiClient = (opts: RepositoryOptions): Sdk => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return getRisksmartApiClient(client);
};
