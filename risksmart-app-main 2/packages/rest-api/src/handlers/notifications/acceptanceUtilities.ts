import { GetAcceptanceParentsByIdDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getAcceptanceParentsById = async ({
  id,
  tenant,
}: {
  id: string;
  tenant: string;
}) => {
  logger.info('Requesting acceptance for', id);
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetAcceptanceParentsByIdDocument,
    variables: {
      Id: id,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get acceptance parent');
  }

  return data.acceptance[0];
};
