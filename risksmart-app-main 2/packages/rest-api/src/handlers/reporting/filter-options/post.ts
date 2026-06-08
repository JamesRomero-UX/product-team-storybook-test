import { singleLambdaBackendHandler } from 'src/backendActionApiHandler';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import {
  getCustomAttributeSchemaLookup,
  getFilterOptionSuggestions,
} from 'src/services/reporting/reportingService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

const logger = getLogger();

export const handler = singleLambdaBackendHandler(PostSchema, async (evt) => {
  const session = getSessionData(evt.session_variables);
  // Double check tenant match. Hasura should not be calling this lambda if the tenants do not match, but double checking to be sure.
  // Would place in some middleware at some point
  if (session.tenant !== getEnv('TENANT')) {
    logger.error('Tenant mismatch', {
      sessionTenant: session.tenant,
      lambdaTenant: getEnv('TENANT'),
    });
    throw new Error('Configuration error. Wrong lambda for tenant');
  }
  const { dataSourceType, fieldId, offset, limit, filteringText } =
    evt.input.Input;

  const orgKey = session.orgKey;
  logger.appendKeys({ orgKey });
  const sessionData = getSessionData(evt.session_variables);
  const customAttributeSchemaLookup =
    await getCustomAttributeSchemaLookup(sessionData);
  const results = await getFilterOptionSuggestions({
    orgKey,
    dataSourceType,
    fieldId,
    offset,
    limit,
    filteringText,
    customAttributeSchemaLookup,
  });

  return {
    statusCode: 200,

    body: JSON.stringify(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.map((r: any) => ({
        value: r[0],
      }))
    ),
  };
});
