import type { ResultOf } from '@graphql-typed-document-node/core';
import { GetRiskByIdDocument } from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
const logger = getLogger();

export const getRiskById = async ({
  riskId,
  tenant,
}: {
  riskId: string;
  tenant: string;
}): Promise<ResultOf<typeof GetRiskByIdDocument>['risk'][number]> => {
  logger.info('Requesting risk for', riskId);

  if (!riskId || riskId.length === 0) {
    throw new Error('Risk not found');
  }

  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetRiskByIdDocument,
    variables: {
      Id: riskId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to risk');
  }

  if (!data.risk[0]) {
    throw new Error('Risk not found');
  }

  return data.risk[0];
};
