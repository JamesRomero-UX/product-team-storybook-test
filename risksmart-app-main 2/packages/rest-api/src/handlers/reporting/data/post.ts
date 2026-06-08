import { PostSchema } from '@risksmart-app/shared/src/reporting/api/schema';
import { singleLambdaBackendHandler } from 'src/backendActionApiHandler';
import { getEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { CustomDatasourceService } from 'src/services/reporting/customDatasourceService';
import {
  getCustomAttributeSchemaLookup,
  getReportData,
} from 'src/services/reporting/reportingService';
import { getSessionData } from 'src/session';

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
  const {
    dataSources,
    fields,
    filters,
    offset,
    limit,
    groupBy,
    aggregateType,
    aggregateField,
  } = evt.input.Input;

  const orgKey = session.orgKey;
  logger.appendKeys({ orgKey });
  const sessionData = getSessionData(evt.session_variables);
  logger.info('Retrieving custom attribute schema lookup');
  const customAttributeSchemaLookup =
    await getCustomAttributeSchemaLookup(sessionData);
  logger.info('Executing getReportData');
  const results = await getReportData({
    orgKey,
    dataSources,
    fields,
    filters,
    offset,
    limit,
    groupBy,
    aggregateType,
    aggregateField,
    customAttributeSchemaLookup,
  });
  logger.info('Initializing CustomDatasourceService');

  const { formatQueryResultsToTable } = await CustomDatasourceService({
    dataSources,
    customAttributeSchemaLookup,
    groupBy,
    fields,
  });

  logger.info('Formatting query results to table');
  const formattedResults = formatQueryResultsToTable(results);
  logger.info('Returning formatted results');

  return {
    statusCode: 200,
    body: JSON.stringify(formattedResults),
  };
});
