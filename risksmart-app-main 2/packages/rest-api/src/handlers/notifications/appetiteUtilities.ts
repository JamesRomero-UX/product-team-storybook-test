import { GetAppetiteParentsByIdDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getAppetiteParentsById = async ({
  id,
  tenant,
}: {
  id: string;
  tenant: string;
}) => {
  logger.info('Requesting appetite', { id });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetAppetiteParentsByIdDocument,
    variables: {
      Id: id,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get appetite parent');
  }

  //If no parents then exit
  if (!data.appetite?.[0]?.parents[0]) {
    throw new Error('Appetite parents not found');
  }

  return data.appetite[0];
};
