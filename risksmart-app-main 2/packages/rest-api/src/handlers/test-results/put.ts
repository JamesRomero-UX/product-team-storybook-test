import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { NotFound } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { Put } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(Put, async (body) => {
  const input = body.input.object;
  logger.appendKeys({
    testResultId: input.Id,
  });
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  await checkPermission(
    body,
    ParentTypeEnum.TestResult,
    AccessTypeEnum.Update,
    input.Id
  );

  const { test_result: testResults } = await apiClient.getTestResultById({
    Id: input.Id,
  });
  const testResult = testResults[0];
  if (!testResult) {
    throw new NotFound();
  }

  if (
    new Date(testResult.ModifiedAtTimestamp).valueOf() !==
    new Date(input.OriginalTimestamp).valueOf()
  ) {
    throw new ModifiedSinceLastViewError();
  }

  const { update_test_result } = await apiClient.updateTestResult(input);
  if (update_test_result?.affected_rows !== 1) {
    throw new Error('Failed to update test result');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: input.Id,
    }),
  };
});
