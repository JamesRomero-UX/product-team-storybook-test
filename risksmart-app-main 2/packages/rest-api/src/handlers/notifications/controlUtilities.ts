import { GetControlParentIdsDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getControlById = async ({
  controlId,
  tenant,
}: {
  controlId: string;
  tenant: string;
}) => {
  logger.info('Requesting control', { controlId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });
  const { control: controls } = await getRisksmartApiClient(
    hasuraClient
  ).getControlById({ Id: controlId });

  return controls[0];
};

export const getControlParentIds = async ({
  controlId,
  tenant,
}: {
  controlId: string;
  tenant: string;
}): Promise<string[]> => {
  logger.info('Requesting control parent IDs', { controlId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetControlParentIdsDocument,
    variables: {
      ControlId: controlId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get control parent IDs');
  }

  return data.control_parent.map((p) => p.ParentId);
};
