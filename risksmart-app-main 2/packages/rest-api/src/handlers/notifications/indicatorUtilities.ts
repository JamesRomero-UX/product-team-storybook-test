import { GetIndicatorsParentsByIdDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getIndicatorParentsById = async ({
  id,
  tenant,
}: {
  id: string;
  tenant: string;
}) => {
  logger.info('Requesting indicator for', id);
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetIndicatorsParentsByIdDocument,
    variables: {
      Id: id,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get indicator risk');
  }

  //If no parents then exit
  if (!data.indicator?.[0]?.parents?.[0]) {
    return null;
  }

  return data.indicator[0];
};
