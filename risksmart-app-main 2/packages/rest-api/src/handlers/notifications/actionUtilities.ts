import { GetActionParentIdsDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getActionById = async ({
  actionId,
  tenant,
}: {
  actionId: string;
  tenant: string;
}) => {
  logger.info('Requesting action', { actionId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });
  const { action_by_pk: action } = await getRisksmartApiClient(
    hasuraClient
  ).getActionById({
    Id: actionId,
  });

  return action;
};

export const getActionParentIds = async ({
  actionId,
  tenant,
}: {
  actionId: string;
  tenant: string;
}): Promise<string[]> => {
  logger.info('Requesting action parent IDs', { actionId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetActionParentIdsDocument,
    variables: {
      ActionId: actionId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get action parent IDs');
  }

  return data.action_parent.map((p) => p.ParentId);
};
