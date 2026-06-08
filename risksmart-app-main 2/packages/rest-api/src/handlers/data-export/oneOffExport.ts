import { GetNormalisedExportDataDocument } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { SYSTEM_ADMIN_ROLE, SYSTEM_USER } from 'src/repositories/types';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { uploadData } from './helpers/oneOffDataUpload';
import { processCustomAttributes } from './helpers/processCustomAttributes';

const logger = getLogger();

export const handler = backendRouteHandler(z.object({}), async (request) => {
  logger.info('Starting one-off data export', JSON.stringify(request));

  const { tenant, orgKey } = getSessionData(request.session_variables);
  const hasuraClient = getHasuraBackendClient(
    tenant,
    orgKey,
    SYSTEM_USER,
    SYSTEM_ADMIN_ROLE
  );

  const { data, errors } = await hasuraClient.query({
    query: GetNormalisedExportDataDocument,
    variables: { orgKey },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get export data');
  }

  // Extract CustomAttributeData as top-level fields
  const processedData = processCustomAttributes(data, true);

  const expiresInSeconds = 600; // 10 minutes
  const presignedDownloadUrl = await uploadData({
    data: processedData,
    orgKey,
    expiresInSeconds,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Data export complete',
      downloadUrl: presignedDownloadUrl,
      expiresInSeconds,
    }),
  };
});
