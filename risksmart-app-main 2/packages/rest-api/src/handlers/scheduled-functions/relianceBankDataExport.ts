import { GetNormalisedRelianceBankExportDataDocument } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { SYSTEM_ADMIN_ROLE, SYSTEM_USER } from 'src/repositories/types';

import { uploadData } from '../data-export/helpers/scheduledDataUpload';
import { getCredentials } from './reliance-bank-data-export-utils/authUtils';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  { tenant: string; orgKey: string },
  void
>(async () => {
  logger.info('Exporting Reliance Bank data');

  const credentials = await getCredentials();
  const { tenant, orgKey } = credentials;

  const hasuraClient = getHasuraBackendClient(
    tenant,
    orgKey,
    SYSTEM_USER,
    SYSTEM_ADMIN_ROLE
  );

  const { data, errors } = await hasuraClient.query({
    query: GetNormalisedRelianceBankExportDataDocument,
    variables: { orgKey },
  });

  if (errors) {
    errors.forEach((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get Reliance Bank export data');
  }

  await uploadData(data, credentials);
});
